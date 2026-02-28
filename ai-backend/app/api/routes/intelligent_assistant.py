"""
Intelligent AI Assistant API endpoint.

Provides contextual, motivational, and coaching responses
based on real-time user behavior and session analysis.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import VoiceCommandRequest
from app.models.responses import VoiceAssistantResponse
from app.services.intelligence_service import intelligence_service
from app.core.auth import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/intelligent-assistant", tags=["AI Assistant"])

@router.post("/voice-command", response_model=VoiceAssistantResponse)
async def process_voice_command(
    request: VoiceCommandRequest,
    current_user=Depends(get_optional_user)
):
    """
    Process voice command with intelligent contextual responses.
    
    Args:
        request: Voice command with user context
        current_user: Current user (optional)
    
    Returns:
        Intelligent response with coaching and motivation
    """
    try:
        # Get user context from session data
        user_context = {
            'focus_level': 75,  # Default, would come from actual session
            'fatigue_level': 20,
            'productivity_score': 80,
            'session_duration': 45
        }
        
        # Process command with intelligence
        response = await intelligence_service.process_voice_command(
            request.command, user_context
        )
        
        logger.info(f"🎤 Processed voice command: {request.command}")
        logger.info(f"🧠 Generated response: {response['response']}")
        
        return VoiceAssistantResponse(
            success=True,
            response=response['response'],
            action=response['action'],
            motivation=response['motivation'],
            user_state=response.get('user_state', 'normal_focus'),
            insights=response.get('insights', []),
            recommendations=response.get('recommendations', []),
            timestamp="2024-01-01T00:00:00Z"
        )
        
    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command")

@router.post("/analyze-context", response_model=VoiceAssistantResponse)
async def analyze_user_context(
    request: dict,
    current_user=Depends(get_optional_user)
):
    """
    Analyze user context and provide intelligent coaching.
    
    Args:
        request: User context data for analysis
        current_user: Current user (optional)
    
    Returns:
        Intelligent analysis and coaching recommendations
    """
    try:
        # Analyze user context
        analysis = await intelligence_service.analyze_user_context(request)
        
        logger.info(f"🧠 Analyzed user context: {analysis['user_state']}")
        
        return VoiceAssistantResponse(
            success=True,
            response=f"🎯 Current state: {analysis['user_state']}",
            action="context_analysis",
            motivation=analysis['motivation'],
            user_state=analysis['user_state'],
            insights=analysis['insights'],
            recommendations=analysis['recommendations'],
            timestamp="2024-01-01T00:00:00Z"
        )
        
    except Exception as e:
        logger.error(f"Error analyzing user context: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze user context")

@router.get("/motivation", response_model=VoiceAssistantResponse)
async def get_motivation(
    current_user=Depends(get_optional_user)
):
    """
    Get motivational message based on current session state.
    
    Args:
        current_user: Current user (optional)
    
    Returns:
        Motivational message and coaching tips
    """
    try:
        # Simulate getting current session data
        user_context = {
            'focus_level': 65,
            'fatigue_level': 30,
            'productivity_score': 75
        }
        
        analysis = await intelligence_service.analyze_user_context(user_context)
        
        return VoiceAssistantResponse(
            success=True,
            response=analysis['motivation'],
            action="motivation",
            motivation=analysis['motivation'],
            user_state=analysis['user_state'],
            insights=analysis['insights'],
            recommendations=analysis['recommendations'],
            timestamp="2024-01-01T00:00:00Z"
        )
        
    except Exception as e:
        logger.error(f"Error getting motivation: {e}")
        raise HTTPException(status_code=500, detail="Failed to get motivation")
