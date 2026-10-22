"""
Monitoring and metrics collection.

This module provides metrics collection for monitoring API performance,
usage statistics, and health indicators.
"""

import time
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from ..core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class Metrics:
    """Application metrics data structure."""
    
    # Request metrics
    total_requests: int = 0
    requests_by_method: Dict[str, int] = field(default_factory=dict)
    requests_by_path: Dict[str, int] = field(default_factory=dict)
    
    # Response metrics
    response_times: list = field(default_factory=list)
    status_codes: Dict[int, int] = field(default_factory=dict)
    
    # Error metrics
    error_count: int = 0
    errors_by_type: Dict[str, int] = field(default_factory=dict)
    
    # Analysis metrics
    analysis_count: int = 0
    analysis_types: Dict[str, int] = field(default_factory=dict)
    avg_analysis_time: float = 0.0
    
    # Session metrics
    active_sessions: int = 0
    sessions_created: int = 0
    sessions_completed: int = 0
    
    # Performance metrics
    cache_hits: int = 0
    cache_misses: int = 0
    database_operations: int = 0
    
    # Timestamps
    start_time: datetime = field(default_factory=datetime.utcnow)
    last_updated: datetime = field(default_factory=datetime.utcnow)


class MetricsCollector:
    """
    Collects and manages application metrics.
    
    For production, consider using Prometheus or similar monitoring systems.
    """
    
    def __init__(self):
        self.metrics = Metrics()
        self.settings = get_settings()
        self.analysis_times = []
    
    def record_request(
        self,
        method: str,
        path: str,
        status_code: int,
        response_time: float
    ):
        """
        Record request metrics.
        
        Args:
            method: HTTP method
            path: Request path
            status_code: Response status code
            response_time: Response time in seconds
        """
        self.metrics.total_requests += 1
        self.metrics.last_updated = datetime.utcnow()
        
        # Method metrics
        self.metrics.requests_by_method[method] = (
            self.metrics.requests_by_method.get(method, 0) + 1
        )
        
        # Path metrics (group similar paths)
        grouped_path = self._group_path(path)
        self.metrics.requests_by_path[grouped_path] = (
            self.metrics.requests_by_path.get(grouped_path, 0) + 1
        )
        
        # Status code metrics
        self.metrics.status_codes[status_code] = (
            self.metrics.status_codes.get(status_code, 0) + 1
        )
        
        # Response time metrics
        self.metrics.response_times.append(response_time)
        
        # Keep only last 1000 response times for memory efficiency
        if len(self.metrics.response_times) > 1000:
            self.metrics.response_times = self.metrics.response_times[-1000:]
        
        # Error metrics
        if status_code >= 400:
            self.metrics.error_count += 1
    
    def record_analysis(
        self,
        analysis_type: str,
        analysis_time: float,
        success: bool = True
    ):
        """
        Record analysis metrics.
        
        Args:
            analysis_type: Type of analysis performed
            analysis_time: Time taken for analysis in seconds
            success: Whether analysis was successful
        """
        self.metrics.analysis_count += 1
        self.metrics.last_updated = datetime.utcnow()
        
        # Analysis type metrics
        self.metrics.analysis_types[analysis_type] = (
            self.metrics.analysis_types.get(analysis_type, 0) + 1
        )
        
        # Analysis time metrics
        self.analysis_times.append(analysis_time)
        
        # Keep only last 500 analysis times
        if len(self.analysis_times) > 500:
            self.analysis_times = self.analysis_times[-500:]
        
        # Calculate average analysis time
        if self.analysis_times:
            self.metrics.avg_analysis_time = sum(self.analysis_times) / len(self.analysis_times)
        
        # Error metrics
        if not success:
            self.metrics.error_count += 1
    
    def record_session_event(self, event_type: str):
        """
        Record session-related metrics.
        
        Args:
            event_type: Type of session event (created, completed, etc.)
        """
        self.metrics.last_updated = datetime.utcnow()
        
        if event_type == "created":
            self.metrics.sessions_created += 1
        elif event_type == "completed":
            self.metrics.sessions_completed += 1
    
    def record_cache_hit(self):
        """Record cache hit."""
        self.metrics.cache_hits += 1
        self.metrics.last_updated = datetime.utcnow()
    
    def record_cache_miss(self):
        """Record cache miss."""
        self.metrics.cache_misses += 1
        self.metrics.last_updated = datetime.utcnow()
    
    def record_database_operation(self):
        """Record database operation."""
        self.metrics.database_operations += 1
        self.metrics.last_updated = datetime.utcnow()
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """
        Get summary of current metrics.
        
        Returns:
            Dictionary containing metrics summary
        """
        uptime = datetime.utcnow() - self.metrics.start_time
        
        # Calculate average response time
        avg_response_time = 0.0
        if self.metrics.response_times:
            avg_response_time = sum(self.metrics.response_times) / len(self.metrics.response_times)
        
        # Calculate cache hit rate
        cache_total = self.metrics.cache_hits + self.metrics.cache_misses
        cache_hit_rate = 0.0
        if cache_total > 0:
            cache_hit_rate = (self.metrics.cache_hits / cache_total) * 100
        
        # Calculate error rate
        error_rate = 0.0
        if self.metrics.total_requests > 0:
            error_rate = (self.metrics.error_count / self.metrics.total_requests) * 100
        
        return {
            "uptime_seconds": int(uptime.total_seconds()),
            "uptime_human": str(uptime),
            
            "requests": {
                "total": self.metrics.total_requests,
                "by_method": self.metrics.requests_by_method,
                "by_path": self.metrics.requests_by_path,
                "avg_response_time": round(avg_response_time, 3),
                "status_codes": self.metrics.status_codes,
                "error_rate": round(error_rate, 2)
            },
            
            "analysis": {
                "total": self.metrics.analysis_count,
                "by_type": self.metrics.analysis_types,
                "avg_time": round(self.metrics.avg_analysis_time, 3)
            },
            
            "sessions": {
                "created": self.metrics.sessions_created,
                "completed": self.metrics.sessions_completed,
                "active": self.metrics.active_sessions
            },
            
            "performance": {
                "cache_hits": self.metrics.cache_hits,
                "cache_misses": self.metrics.cache_misses,
                "cache_hit_rate": round(cache_hit_rate, 2),
                "database_operations": self.metrics.database_operations
            },
            
            "errors": {
                "total": self.metrics.error_count,
                "error_rate": round(error_rate, 2)
            },
            
            "timestamps": {
                "start_time": self.metrics.start_time.isoformat(),
                "last_updated": self.metrics.last_updated.isoformat()
            }
        }
    
    def _group_path(self, path: str) -> str:
        """
        Group similar paths for metrics aggregation.
        
        Args:
            path: Request path
            
        Returns:
            Grouped path name
        """
        # Group analysis endpoints
        if path.startswith("/analyze/"):
            return "/analyze/*"
        
        # Group session endpoints
        if path.startswith("/session/"):
            if path.count("/") > 2:  # Has session ID
                return "/session/{id}"
            else:
                return "/session/*"
        
        # Group health endpoints
        if path.startswith("/health"):
            return "/health/*"
        
        return path
    
    def reset_metrics(self):
        """Reset all metrics."""
        self.metrics = Metrics()
        self.analysis_times = []
        logger.info("📊 Metrics reset")


# Global metrics collector instance
metrics_collector = MetricsCollector()
