"""
Intelligent AI Assistant Service for WorkSpace.

This service provides contextual, motivational, and coaching responses
based on user behavior, session data, and real-time analysis.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class IntelligenceService:
    """
    AI-powered coaching and motivation service.
    
    Provides intelligent responses based on:
    - User's current activity and focus level
    - Session history and patterns
    - Time of day and energy levels
    - Educational vs distraction balance
    """
    
    def __init__(self):
        self.motivational_quotes = [
            "🎯 Focus on your goals, success will follow!",
            "💪 Every productive minute counts toward your dreams!",
            "🌟 You are building your future with each focused moment!",
            "📚 Education is the investment that never depreciates!",
            "🎖️ Your discipline today creates your success tomorrow!",
            "⚡ Stay focused, greatness takes consistent effort!",
            "🧠 Your mind is a powerful tool - use it wisely!",
            "🏆 Excellence is not a single act, but a habit!",
            "🌱 Growth happens outside your comfort zone!",
            "⏰ Time is your most valuable resource - spend it well!"
        ]
        
        self.coaching_tips = {
            "high_distraction": [
                "🎯 Try the 25-minute focus technique: 25 min work, 5 min break",
                "📵 Put your phone in another room to reduce temptation",
                "🎧 Use noise-cancelling headphones or focus music",
                "⏰ Set specific goals for each study session",
                "🚫 Use website blockers during deep work sessions"
            ],
            "low_energy": [
                "☕ Take a strategic caffeine break if needed",
                "🚶‍♂️ Stand up and stretch for 5 minutes",
                "💧 Drink water and have a healthy snack",
                "🌤 Consider switching to a lighter subject temporarily",
                "⏱️ Break down large tasks into smaller chunks"
            ],
            "procrastination": [
                "🎯 Just start with 5 minutes - you can do anything for 5 minutes!",
                "📝 Write down your top 3 priorities for today",
                "⏰ Use the 2-minute rule: if it takes <2 min, do it now",
                "🎮 Reward yourself after completing difficult tasks",
                "👥 Tell someone your goals to create accountability"
            ],
            "educational": [
                "📚 Connect new learning to what you already know",
                "🎯 Practice active recall: explain concepts out loud",
                "💡 Use the Feynman technique: teach it to someone else",
                "🔗 Create mind maps to visualize connections",
                "⏰ Review notes within 24 hours to reinforce learning"
            ]
        }
        
        self.productivity_insights = [
            "Your focus peaks in the morning - tackle important tasks then!",
            "You have been consistent for 3 days - keep the momentum going!",
            "Your productivity increased by 15% this week - amazing progress!",
            "Educational content makes up 60% of your screen time - excellent balance!",
            "You are most productive between 9-11 AM - schedule important work then!",
            "Consider a 15-minute break to recharge your focus batteries."
        ]

    async def analyze_user_context(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user context to provide personalized coaching.
        """
        try:
            focus_level = user_data.get('focus_level', 50)
            fatigue_level = user_data.get('fatigue_level', 0)
            session_duration = user_data.get('session_duration', 0)
            distraction_score = user_data.get('distraction_score', 0)
            educational_content = user_data.get('educational_content_ratio', 0)
            
            # Determine user state
            user_state = self._determine_user_state(
                focus_level, fatigue_level, distraction_score, session_duration
            )
            
            # Generate insights
            insights = self._generate_insights(user_data, user_state)
            
            # Generate coaching
            coaching = self._generate_coaching(user_state, insights)
            
            # Generate motivation
            motivation = self._generate_motivation(user_state, insights)
            
            return {
                'user_state': user_state,
                'insights': insights,
                'coaching': coaching,
                'motivation': motivation,
                'recommendations': self._generate_recommendations(user_state)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing user context: {e}")
            return self._get_fallback_response()

    def _determine_user_state(self, focus: float, fatigue: float, 
                          distraction: float, duration: int) -> str:
        """Determine the user's current state."""
        
        if fatigue > 70:
            return "high_fatigue"
        elif distraction > 60:
            return "highly_distracted"
        elif focus < 30:
            return "low_focus"
        elif fatigue > 50:
            return "moderate_fatigue"
        elif distraction > 30:
            return "moderately_distracted"
        elif focus > 80 and educational_content > 50:
            return "deep_learning"
        elif duration > 120:
            return "extended_session"
        else:
            return "normal_focus"

    def _generate_insights(self, user_data: Dict[str, Any], user_state: str) -> List[str]:
        """Generate personalized insights based on user data."""
        insights = []
        
        focus_level = user_data.get('focus_level', 50)
        session_duration = user_data.get('session_duration', 0)
        
        # Pattern-based insights
        if session_duration > 60:
            insights.append("📊 Extended session detected - consider taking breaks")
        
        if focus_level > 80:
            insights.append("🎯 High focus level maintained - excellent concentration!")
        
        if user_state == "deep_learning":
            insights.append("🧠 Deep learning mode detected - complex cognitive engagement")
        
        # Time-based insights
        current_hour = datetime.now().hour
        if 9 <= current_hour <= 11:
            insights.append("⏰ Morning peak performance time - maximize deep work!")
        elif 14 <= current_hour <= 16:
            insights.append("😴 Afternoon energy dip detected - consider lighter tasks")
        
        return insights

    def _generate_coaching(self, user_state: str, insights: List[str]) -> List[str]:
        """Generate coaching tips based on user state."""
        coaching = []
        
        if user_state == "highly_distracted":
            coaching.extend(self.coaching_tips["high_distraction"])
        elif user_state == "low_focus":
            coaching.extend(self.coaching_tips["low_energy"])
        elif user_state == "moderately_distracted":
            coaching.extend(self.coaching_tips["procrastination"])
        elif user_state == "deep_learning":
            coaching.extend(self.coaching_tips["educational"])
        elif "Extended session" in str(insights):
            coaching.append("⏱️ Consider the Pomodoro Technique for longer sessions")
        
        return coaching[:3]  # Limit to top 3 most relevant tips

    def _generate_motivation(self, user_state: str, insights: List[str]) -> str:
        """Generate motivational message based on user state."""
        
        # Contextual motivation
        if user_state == "high_fatigue":
            return "🔋 Rest is productive too! Your brain needs recharge to perform at its best."
        elif user_state == "highly_distracted":
            return "🎯 Every distraction overcome makes you stronger. Refocus and win!"
        elif user_state == "deep_learning":
            return "🌟 Your brain is growing! This focus time is building your future."
        elif user_state == "normal_focus":
            return random.choice(self.motivational_quotes)
        else:
            return "💪 You have got this! Stay focused and keep progressing!"

    def _generate_recommendations(self, user_state: str) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        if user_state == "high_fatigue":
            recommendations.extend([
                "😴 Take a 20-minute power nap",
                "💧 Hydrate and have a healthy snack",
                "🚶‍♂️ Do some light stretching exercises"
            ])
        elif user_state == "highly_distracted":
            recommendations.extend([
                "🚫 Enable strict website blocking",
                "📵 Move to a distraction-free environment",
                "⏰ Try the 5-minute rule to overcome procrastination"
            ])
        elif user_state == "low_focus":
            recommendations.extend([
                "☕ Consider moderate caffeine intake",
                "🎵 Try focus music or white noise",
                "📝 Break down tasks into smaller steps"
            ])
        
        return recommendations

    def _get_fallback_response(self) -> Dict[str, Any]:
        """Fallback response if analysis fails."""
        return {
            'user_state': 'unknown',
            'insights': ['🤖 AI analysis temporarily unavailable'],
            'coaching': ['💡 Focus on your current task'],
            'motivation': '🌟 Keep up the great work!',
            'recommendations': ['📊 Check your session summary later']
        }

    async def process_voice_command(self, command: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process voice commands with intelligent responses.
        """
        try:
            command_lower = command.lower().strip()
            
            # Session control commands
            if any(word in command_lower for word in ['start', 'begin', 'launch']):
                return {
                    'response': '🚀 Session started! Focus mode activated.',
                    'action': 'start_session',
                    'motivation': "Let us make this session count! 🎯"
                }
            
            if any(word in command_lower for word in ['stop', 'end', 'finish']):
                return {
                    'response': '⏹️ Session ended! Great job on your focus!',
                    'action': 'end_session',
                    'motivation': "Rest well - you have earned it! 💪"
                }
            
            if any(word in command_lower for word in ['pause', 'break']):
                return {
                    'response': '⏸️ Session paused. Take a 5-minute break!',
                    'action': 'pause_session',
                    'motivation': "Breaks recharge your brain! 🔋"
                }
            
            if any(word in command_lower for word in ['resume', 'continue']):
                return {
                    'response': '▶️ Session resumed! Let us get back to focus!',
                    'action': 'resume_session',
                    'motivation': "Ready to dive back in! 🌊"
                }
            
            # Focus and blocking commands
            if any(word in command_lower for word in ['block', 'block site']):
                return {
                    'response': '🚫 Current site will be blocked. Back to work!',
                    'action': 'block_site',
                    'motivation': "Removing distractions = clearing your path! 🎯"
                }
            
            if any(word in command_lower for word in ['unblock', 'allow']):
                return {
                    'response': '✅ Site unblocked. Use it wisely!',
                    'action': 'unblock_site',
                    'motivation': "Self-control is the ultimate productivity! 💪"
                }
            
            # Status and analytics commands
            if any(word in command_lower for word in ['status', 'how am i doing', 'progress']):
                focus_level = user_context.get('focus_level', 50)
                productivity = user_context.get('productivity_score', 0)
                
                return {
                    'response': f'📊 Focus: {focus_level}%, Productivity: {productivity}%',
                    'action': 'status_update',
                    'motivation': self._get_status_motivation(focus_level, productivity)
                }
            
            # Help and encouragement commands
            if any(word in command_lower for word in ['help', 'motivate', 'encourage']):
                return {
                    'response': random.choice(self.motivational_quotes),
                    'action': 'motivation',
                    'motivation': "You are doing great! Keep pushing forward! 🌟"
                }
            
            # Educational content commands
            if any(word in command_lower for word in ['study', 'learn', 'educational']):
                return {
                    'response': '📚 Switching to optimal learning mode!',
                    'action': 'educational_mode',
                    'motivation': "Education is investment in yourself! 🧠"
                }
            
            # Default response
            return {
                'response': "🎯 I am here to help! Try 'start session', 'block site', or 'status'.",
                'action': 'unknown',
                'motivation': "Ready to assist your productivity journey! 🚀"
            }
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            return {
                'response': '❌ I had trouble understanding that. Try again!',
                'action': 'error',
                'motivation': "Every attempt is progress! 💪"
            }

    def _get_status_motivation(self, focus: float, productivity: float) -> str:
        """Get motivational message based on current status."""
        if focus >= 80 and productivity >= 80:
            return "🔥 You are on fire! Exceptional focus and productivity! 🏆"
        elif focus >= 60:
            return "💪 Strong focus today! You are building momentum! 📈"
        elif focus >= 40:
            return "🌟 Good steady progress! Keep it up! 📊"
        else:
            return "🎯 Every focused moment matters! You can do this! 💪"

# Global instance
intelligence_service = IntelligenceService()
