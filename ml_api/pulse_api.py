/**
 * PULSE ML API Interface (Python)
 * 
 * This file serves as the main gateway for the Pulse Machine Learning engine.
 * it coordinates the loading of specialized predictors (Productivity, Burnout, Persona)
 * and provides a unified 'predict_all' interface for the Node.js backend to consume.
 */

import os
import pandas as pd
from .predictor_classes import ProductivityPredictor, BurnoutClassifier, PersonaEngine, PulseExplainer
from .constants import FEATURE_AVERAGES

class PulseAPI:
    """
    Main API Class for Pulse ML operations.
    Loads models on initialization and provides a single method to run all predictions.
    """
    
    def __init__(self, model_dir='pulse_models'):
        """
        Initializes the PulseAPI by loading all required ML models and explainers.
        
        Parameters:
        model_dir (str): The directory where serialized (.pkl) models are stored.
        """
        # Ensure we find the model directory even if called from different subfolders
        if not os.path.exists(model_dir):
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'pulse_models')
        
        # Instantiate specific prediction engines
        self.productivity_model = ProductivityPredictor(model_dir)
        self.burnout_model = BurnoutClassifier(model_dir)
        self.persona_model = PersonaEngine(model_dir)
        
        # The explainer provides 'why' behind the scores (impact analysis)
        self.explainer = PulseExplainer(self.productivity_model, self.burnout_model)

    def predict_all(self, user_input):
        """
        Processes raw user input and runs it through all three Pulse models.
        
        This method handles data preprocessing, filling missing values with feature averages,
        and aggregating results into a structured dictionary.

        Parameters:
        user_input (dict): A dictionary containing user metrics (e.g., 'sleep_hours', 'stress_level').

        Returns:
        dict: A comprehensive result set including productivity scores, burnout risks, and personas.
        """
        
        # 1. DATA PREPARATION
        # Ensure naming consistency between frontend 'screen_time' and ML 'screen_time_hours'
        if 'screen_time' in user_input and 'screen_time_hours' not in user_input:
            user_input['screen_time_hours'] = user_input.pop('screen_time')

        # Create a DataFrame and fill any missing fields with global historical averages
        # This prevents the models from failing if the user leaves a field blank.
        data = {**FEATURE_AVERAGES, **user_input}
        df = pd.DataFrame([data])

        # 2. RUN PREDICTIONS
        # Calculate the numerical productivity score
        prod_score = self.productivity_model.predict(df)
        
        # Determine burnout risk (Low/Medium/High) and confidence levels
        risk, confidence = self.burnout_model.predict(df)
        
        # Categorize the user into a behavioral persona (e.g., 'Balanced Optimizer')
        persona, cluster_id, reason = self.persona_model.predict(df)
        
        # Generate explanations (which factors helped or hurt the score)
        pos_details, neg_details, contributions = self.explainer.explain(df)

        # 3. CONSOLIDATE RESULTS
        return {
            "productivity_score": prod_score,
            "burnout_risk": risk,
            "burnout_confidence_scores": confidence,
            "persona": persona,
            "persona_reason": reason,
            "cluster_id": cluster_id,
            "top_positive_factors_detailed": pos_details,
            "top_negative_factors_detailed": neg_details,
            "factor_contributions": contributions,
            # Simplified factor labels for UI elements
            "top_positive_factors": [f['label'] for f in pos_details],
            "top_negative_factors": [f['label'] for f in neg_details]
        }


