import pickle
import pandas as pd
import numpy as np
import os
from .constants import CORE_FEATURES, CLASSIFIER_FEATURES

class BasePredictor:
    def __init__(self, model_dir):
        self.model_dir = model_dir

    def _load_pkl(self, filename):
        path = os.path.join(self.model_dir, filename)
        with open(path, 'rb') as f:
            return pickle.load(f)

class ProductivityPredictor(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('productivity_model.pkl')
        self.scaler = self._load_pkl('productivity_scaler.pkl')

    def predict(self, df):
        X_sc = self.scaler.transform(df[CORE_FEATURES])
        score = self.model.predict(X_sc)[0]
        return round(float(np.clip(score, 0, 100)), 1)

class BurnoutClassifier(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('burnout_model.pkl')
        self.scaler = self._load_pkl('burnout_scaler.pkl')
        self.label_encoder = self._load_pkl('burnout_label_encoder.pkl')
        self.feature_cols = self._load_pkl('burnout_feature_cols.pkl')

    def predict(self, df):
        # The model uses the expanded CLASSIFIER_FEATURES including one-hot encoded day_of_week
        processed_df = df.copy()
        
        # One-hot encoding for day_of_week
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            col_name = f'day_of_week_{day}'
            processed_df[col_name] = (processed_df['day_of_week'] == day).astype(int)
            
        # Ensure all feature_cols are present and in correct order
        X = processed_df[self.feature_cols]
        X_sc = self.scaler.transform(X)
        
        probs = self.model.predict_proba(X_sc)[0]
        pred_idx = np.argmax(probs)
        
        risk_label = self.label_encoder.inverse_transform([pred_idx])[0]
        
        # Create full confidence map
        all_labels = self.label_encoder.classes_
        confidence_map = {label: round(float(prob), 2) for label, prob in zip(all_labels, probs)}
        
        return risk_label, confidence_map



class PersonaEngine(BasePredictor):
    def __init__(self, model_dir):
        super().__init__(model_dir)
        self.model = self._load_pkl('kmeans_model.pkl')
        self.scaler = self._load_pkl('kmeans_scaler.pkl')
        # Labels mapping based on notebook analysis
        self.persona_labels = {
            0: "Balanced",
            1: "High Performer",
            2: "Under Pressure",
            3: "Restricted Sleep"
        }

    def predict(self, df):
        X_sc = self.scaler.transform(df[CORE_FEATURES])
        cluster_id = int(self.model.predict(X_sc)[0])
        persona = self.persona_labels.get(cluster_id, f"Cluster {cluster_id}")
        return persona, cluster_id

class PulseExplainer:
    def __init__(self, productivity_model, burnout_model):
        self.productivity_model = productivity_model
        self.burnout_model = burnout_model

    def explain(self, df):
        # Basic explanation for Productivity based on top coefficients
        # In a real scenario, this would calculate local SHAP values or similar
        # For this version, we'll return fixed insights based on global feature weights
        
        # Positive: study_hours, sleep_hours, exercise_mins, mood_score, water_litres, deep_focus_blocks
        # Negative: stress_level, screen_time_hours, caffeine_intake, social_media_mins
        
        pos_keys = ['study_hours', 'sleep_hours', 'exercise_mins', 'mood_score', 'water_litres', 'deep_focus_blocks']
        neg_keys = ['stress_level', 'screen_time_hours', 'caffeine_intake', 'social_media_mins']
        
        # We can dynamically check if values are above/below average to personalize
        top_pos = ["Study Session Length", "Sleep Quality"]
        top_neg = ["Elevated Stress", "High Screen Time"]
        
        return top_pos, top_neg
