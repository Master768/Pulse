import pickle
import pandas as pd
import numpy as np
import os
from .constants import CORE_FEATURES, CLASSIFIER_FEATURES

/**
 * BASE PREDICTOR CLASS
 * A helper class that handles common operations like loading serialized model files (.pkl).
 */
class BasePredictor:
    def __init__(self, model_dir):
        self.model_dir = model_dir

    def _load_pkl(self, filename):
        """Loads a pickle file from the model directory."""
        path = os.path.join(self.model_dir, filename)
        with open(path, 'rb') as f:
            return pickle.load(f)

/**
 * PRODUCTIVITY PREDICTOR
 * Calculates a numerical productivity score (0-100) based on daily metrics.
 * 
 * Logic:
 * 1. Base ML Prediction: Uses a Scikit-Learn model and Scaler.
 * 2. Biological Weighting: Applies heuristic corrections for extreme stress, screen time, etc.
 * 3. Synergy Boosts: Rewards hydration and deep focus blocks.
 */
class ProductivityPredictor(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('productivity_model.pkl')
        self.scaler = self._load_pkl('productivity_scaler.pkl')

    def predict(self, df):
        """
        Calculates the final productivity score for a given set of metrics.
        INPUT: DataFrame with user metrics
        OUTPUT: Float (0-100) rounded to 1 decimal place.
        """
        from .constants import WEIGHT_MULTIPLIERS, SYNERGY_RULES
        
        # Scale features and get baseline from ML model
        X_sc = self.scaler.transform(df[CORE_FEATURES])
        base_score = self.model.predict(X_sc)[0]
        
        # Extract individual metrics for heuristic adjustments
        stress = df['stress_level'].values[0]
        screen_time = df['screen_time_hours'].values[0]
        water = df['water_litres'].values[0]
        caffeine = df['caffeine_intake'].values[0]
        deep_focus = df['deep_focus_blocks'].values[0]
        
        # 1. NEGATIVE CORRECTIONS (Penalize habits that lower cognitive capacity)
        penalty = 0
        if stress > 4: penalty += (stress - 4) * 8
        if screen_time > 8: penalty += (screen_time - 8) * 5
        
        # 2. CAFFEINE JITTER (Applies a penalty if usage exceeds safe thresholds)
        if caffeine > SYNERGY_RULES['caffeine_threshold']:
            penalty += (caffeine - SYNERGY_RULES['caffeine_threshold']) * abs(WEIGHT_MULTIPLIERS['caffeine_intake']) * 10
            
        # 3. POSITIVE BOOSTS (Reward healthy habits)
        boost = 0
        boost += water * WEIGHT_MULTIPLIERS['water_litres']
        boost += deep_focus * WEIGHT_MULTIPLIERS['deep_focus_blocks']
        
        # Final calculation: ML Base - Penalties + Boosts
        final_score = base_score - penalty + boost
        return round(float(np.clip(final_score, 0, 100)), 1)

/**
 * BURNOUT CLASSIFIER
 * Predicts the risk of burnout (Low, Medium, High).
 * 
 * It uses categorical encoding for the 'day_of_week' and a Random Forest (or similar) classifier.
 */
class BurnoutClassifier(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('burnout_model.pkl')
        self.scaler = self._load_pkl('burnout_scaler.pkl')
        self.label_encoder = self._load_pkl('burnout_label_encoder.pkl')
        self.feature_cols = self._load_pkl('burnout_feature_cols.pkl')

    def predict(self, df):
        """
        Predicts burnout risk and provides confidence scores for each level.
        INPUT: DataFrame with user metrics
        OUTPUT: (str RiskLevel, dict ConfidenceMapping)
        """
        processed_df = df.copy()
        
        # One-hot encode day of week for the ML model
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            col_name = f'day_of_week_{day}'
            processed_df[col_name] = (processed_df['day_of_week'] == day).astype(int)
            
        # Ensure feature alignment with training data
        X = processed_df[self.feature_cols]
        X_sc = self.scaler.transform(X)
        
        # Get probabilities for each class
        probs = self.model.predict_proba(X_sc)[0]
        risk_label = self.label_encoder.inverse_transform([np.argmax(probs)])[0]
        
        # Map probabilities to human-readable labels
        confidence_map = {label: round(float(prob), 2) for label, prob in zip(self.label_encoder.classes_, probs)}
        return risk_label, confidence_map

/**
 * PERSONA ENGINE
 * Categorizes users into behavioral "personas" based on their habits.
 * 
 * Logic:
 * 1. Clustering: Uses K-Means to find the nearest behavioral cluster.
 * 2. Heuristic Overrides: Adds a "Reality Check" layer to ensure personas match 
 *    obvious edge cases (e.g., extremely high study hours).
 */
class PersonaEngine(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('kmeans_model.pkl')
        self.scaler = self._load_pkl('kmeans_scaler.pkl')
        
        # Human-readable labels for ML clusters
        self.persona_labels = {
            0: "Balanced Optimizer", 
            1: "High Performer", 
            2: "Under Pressure", 
            3: "Restricted Sleep"
        }

    def predict(self, df):
        """
        Determines the user's performance persona.
        INPUT: DataFrame with user metrics
        OUTPUT: (str PersonaTitle, int ClusterID, str Reason)
        """
        # Step 1: Base ML Clustering
        X_sc = self.scaler.transform(df[CORE_FEATURES])
        cluster_id = int(self.model.predict(X_sc)[0])
        persona = self.persona_labels.get(cluster_id, f"Cluster {cluster_id}")
        reason = "Behavior patterns align with historical consistency."

        # Step 2: HEURISTIC OVERRIDES (The "Reality Check" Layer)
        # This ensures the persona accurately reflects immediate extreme behavior.
        stress = df['stress_level'].values[0]
        sleep = df['sleep_hours'].values[0]
        study = df['study_hours'].values[0]
        
        if stress > 4:
            persona = "High Pressure"
            reason = "Detected elevated stress markers significantly impacting baseline."
        elif sleep < 6 and stress > 3:
            persona = "Sleep Deprived / Strained"
            reason = "Combination of low sleep and moderate stress detected."
        elif study > 8:
            persona = "Elite Focus"
            reason = "Extended deep work sessions detected during this period."
        elif study < 2 and stress < 2:
            persona = "Passive Recovery"
            reason = "Low engagement paired with low stress indicates a rest day."

        return persona, cluster_id, reason

/**
 * PULSE EXPLAINER
 * Breaks down the "Why" behind the productivity score.
 * 
 * It calculates the impact of each feature by multiplying the model's coefficients 
 * by the user's specific values, highlighting what most helped or hurt.
 */
class PulseExplainer:
    def __init__(self, productivity_model, burnout_model):
        self.productivity_model = productivity_model
        self.burnout_model = burnout_model

    def explain(self, df):
        """
        Generates detailed positive and negative factor insights.
        INPUT: DataFrame with user metrics
        OUTPUT: (list PositiveFactors, list NegativeFactors, list AllContributions)
        """
        from .constants import FEATURE_METADATA, FEATURE_AVERAGES, WEIGHT_MULTIPLIERS, SYNERGY_RULES
        
        # Calculate impacts: Impact = Coefficient * Scaled Value + Adjustments
        coefs = self.productivity_model.model.coef_
        X_sc = self.productivity_model.scaler.transform(df[CORE_FEATURES])[0]
        
        contributions = []
        for i, feat in enumerate(CORE_FEATURES):
            val = df[feat].values[0]
            impact = coefs[i] * X_sc[i]
            
            # Incorporate explicit weights into the explanation visibility
            if feat == 'water_litres':
                impact += val * WEIGHT_MULTIPLIERS['water_litres']
            elif feat == 'deep_focus_blocks':
                impact += val * WEIGHT_MULTIPLIERS['deep_focus_blocks']
            elif feat == 'caffeine_intake' and val > SYNERGY_RULES['caffeine_threshold']:
                impact -= (val - SYNERGY_RULES['caffeine_threshold']) * 0.2
            elif feat == 'social_media_mins' and val < SYNERGY_RULES['social_media_threshold']:
                impact = abs(impact) if impact < 0 else impact + 2.0 
                
            contributions.append({
                'feature': feat,
                'impact': round(impact, 2),
                'value': val,
                'avg': FEATURE_AVERAGES.get(feat, 0)
            })
            
        # Select key insights to show the user
        contributions.sort(key=lambda x: abs(x['impact']), reverse=True)
        
        pos_details = []
        neg_details = []
        
        for c in contributions:
            feat = c['feature']
            if feat not in FEATURE_METADATA: continue
            meta = FEATURE_METADATA[feat]
            impact_str = f"{'+' if c['impact'] >=0 else ''}{c['impact']} pts"
            
            if c['impact'] > 0 and len(pos_details) < 3:
                pos_details.append({
                    'label': meta['label'],
                    'insight': f"{meta['positive']} ({impact_str})",
                    'impact': c['impact']
                })
            elif c['impact'] < 0 and len(neg_details) < 3:
                neg_details.append({
                    'label': meta['label'],
                    'insight': f"{meta['negative']} ({impact_str})",
                    'impact': c['impact']
                })
                
        return pos_details, neg_details, contributions

