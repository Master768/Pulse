"""
ML CONSTANTS & CONFIGURATION

This file acts as the "Brain's Settings". It contains:
1. Baseline averages for filling missing data.
2. Feature definitions required by the Scikit-Learn models.
3. Metadata for humanizing raw numbers into readable insights.
4. Heuristic weights and thresholds for the Synergy Engine.
"""

# GLOBAL FEATURE AVERAGES
# Derived from the 'pulse_dataset.csv'.
# If a user skips a question, the ML model uses these values to avoid calculation errors.
FEATURE_AVERAGES = {
    "sleep_hours": 5.944135,
    "study_hours": 6.214414,
    "screen_time_hours": 5.289651,
    "exercise_mins": 27.55959,
    "mood_score": 3.295959,
    "stress_level": 2.964698,
    "caffeine_intake": 2.75049,
    "water_litres": 2.307828,
    "deep_focus_blocks": 3.4507,
    "social_media_mins": 110.88499,
    "focus_duration_mins": 227,
    "focus_quality_score": 3.67,
    "distraction_level_encoded": 1,
    "day_of_week": "Monday",
    "is_weekend": 0
}

# FEATURE SCHEMAS
# These lists must exactly match the data format used during model training.
CORE_FEATURES = [
    'sleep_hours', 'study_hours', 'screen_time_hours',
    'exercise_mins', 'mood_score', 'stress_level',
    'caffeine_intake', 'water_litres', 'deep_focus_blocks',
    'social_media_mins', 'focus_duration_mins',
    'focus_quality_score', 'distraction_level_encoded'
]

CLASSIFIER_FEATURES = CORE_FEATURES + ['day_of_week', 'is_weekend']

# INSIGHT ENGINE METADATA
# This dictionary maps raw feature names to human-friendly labels 
# and provides positive/negative context strings for the Dashboard.
FEATURE_METADATA = {
    'sleep_hours': {
        'label': 'Sleep Quality',
        'better': 'higher',
        'positive': 'Optimal sleep duration is restoring your cognitive faculties.',
        'negative': 'Insufficient sleep is creating a significant cognitive debt.'
    },
    'study_hours': {
        'label': 'Study Engagement',
        'better': 'higher',
        'positive': 'Deep study engagement is the primary driver of your output.',
        'negative': 'Low academic engagement is currently capping your potential.'
    },
    'screen_time_hours': {
        'label': 'Digital Distraction',
        'better': 'lower',
        'positive': 'Mindful device usage is preserving your attention span.',
        'negative': 'Excessive screen time is heavily siphoning your mental energy.'
    },
    'exercise_mins': {
        'label': 'Physical Vitality',
        'better': 'higher',
        'positive': 'Physical activity is boosting your metabolic focus.',
        'negative': 'Lack of movement may be contributing to cognitive stagnation.'
    },
    'mood_score': {
        'label': 'Emotional State',
        'better': 'higher',
        'positive': 'A positive emotional state is lubricating your productivity.',
        'negative': 'Suppressed mood markers are increasing the friction of work.'
    },
    'stress_level': {
        'label': 'System Stress',
        'better': 'lower',
        'positive': 'Low systemic stress is allowing for optimal flow.',
        'negative': 'Elevated stress is triggering defensive cognitive patterns.'
    },
    'caffeine_intake': {
        'label': 'Chemical Stimulus',
        'better': 'lower',
        'positive': 'Moderate caffeine usage is giving you a clean focus edge.',
        'negative': 'Excessive caffeine may be causing focus jitter and crashes.'
    },
    'water_litres': {
        'label': 'Hydration Level',
        'better': 'higher',
        'positive': 'Excellent hydration is maintaining cellular focus.',
        'negative': 'Dehydration might be causing a subtle brain fog.'
    },
    'deep_focus_blocks': {
        'label': 'Deep Focus',
        'better': 'higher',
        'positive': 'Consistent deep work blocks are maximizing your efficiency.',
        'negative': 'Fragmented focus blocks are reducing your total output.'
    },
    'social_media_mins': {
        'label': 'Digital Connection',
        'better': 'lower',
        'positive': 'Mindful social connectivity is supporting your mental well-being.',
        'negative': 'Excessive digital consumption is fragmenting your focus loops.'
    },
    'focus_quality_score': {
        'label': 'Focus Intensity',
        'better': 'higher',
        'positive': 'The intensity of your focus today was exceptional.',
        'negative': 'Shallow focus quality is slowing down your progress.'
    }
}

# HYBRID HEURISTIC WEIGHTS
# These define how the Synergy Engine (Reality Check) adjusts the ML score.
# Positive values boost the score; negative values penalize it.
WEIGHT_MULTIPLIERS = {
    'water_litres': 2.5,     # 1L = +2.5 points boost
    'deep_focus_blocks': 4.0, # 1 Block = +4 points boost
    'caffeine_intake': -0.02, # Penalty per mg over threshold
    'sleep_hours': 1.5,      # Multiplier for sleep impact compared to baseline
}

# SYSTEM THRESHOLDS
# Critical limits used by the Explainer and Synergy engines.
SYNERGY_RULES = {
    'caffeine_threshold': 400, # mg (Standard daily limit)
    'water_target': 2.5,       # litres for full hydration boost
    'sleep_deprived': 6.0,     # hours threshold for cognitive penalty
    'social_media_threshold': 120, # minutes (Threshold for "High Consumption")
}

