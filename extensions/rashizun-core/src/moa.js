/**
 * Protocol 3.1: Mixture of Agents (MoA) Orchestrator
 * This module selects the most cost-effective model based on task complexity.
 */

const TASK_COMPLEXITY = {
    DEBUG: 'low',
    REFACTOR: 'medium',
    ARCHITECTURE: 'high',
    DOCUMENTATION: 'low'
};

const MODELS = {
    LOCAL: 'rashizun-1b-local',      // Internal Tokens (0 cost)
    BALANCED: 'rashizun-8b-edge',   // Hybrid
    STRATEGIC: 'strategic-reasoner' // External Tokens (High cost)
};

function selectModel(taskType) {
    const complexity = TASK_COMPLEXITY[taskType] || 'medium';
    
    switch (complexity) {
        case 'low':
            return MODELS.LOCAL;
        case 'medium':
            return MODELS.BALANCED;
        case 'high':
            return MODELS.STRATEGIC;
        default:
            return MODELS.BALANCED;
    }
}

module.exports = {
    selectModel,
    MODELS
};
