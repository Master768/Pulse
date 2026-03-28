import os
import pandas as pd
from .predictor_classes import ProductivityPredictor, BurnoutClassifier, PersonaEngine, PulseExplainer
from .constants import FEATURE_AVERAGES

class PulseAPI:
    def __init__(self, model_dir='pulse_models'):
        # Correct path if running from root or ml_api dir
        if not os.path.exists(model_dir):
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'pulse_models')
        
        self.productivity_model = ProductivityPredictor(model_dir)
        self.burnout_model = BurnoutClassifier(model_dir)
        self.persona_model = PersonaEngine(model_dir)
        self.explainer = PulseExplainer(self.productivity_model, self.burnout_model)

    def predict_all(self, user_input):
        """
        Takes raw user input, fills missing fields with global averages,
        and runs all 3 models.
        """
        # 1. Prepare Data
        # Ensure 'screen_time' from request maps to 'screen_time_hours' if needed
        if 'screen_time' in user_input and 'screen_time_hours' not in user_input:
            user_input['screen_time_hours'] = user_input.pop('screen_time')

        # Create DataFrame with defaults
        data = {**FEATURE_AVERAGES, **user_input}
        df = pd.DataFrame([data])

        # 2. Run Predictions
        prod_score = self.productivity_model.predict(df)
        risk, confidence = self.burnout_model.predict(df)
        persona, cluster_id = self.persona_model.predict(df)
        pos_factors, neg_factors = self.explainer.explain(df)

        return {
            "productivity_score": prod_score,
            "burnout_risk": risk,
            "burnout_confidence_scores": confidence,
            "persona": persona,
            "cluster_id": cluster_id,
            "top_positive_factors": pos_factors,
            "top_negative_factors": neg_factors
        }

