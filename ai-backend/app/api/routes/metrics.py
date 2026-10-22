"""
Metrics endpoint for monitoring and observability.

This module provides endpoints to access application metrics
and performance data for monitoring and debugging.
"""

import logging
from fastapi import APIRouter, Depends, Response
from app.core.metrics import metrics_collector
from app.core.auth import get_current_user
from app.core.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("")
async def get_metrics(
    current_user=Depends(get_current_user)  # Require authentication for metrics
):
    """
    Get application metrics and performance data.
    
    Returns:
        Dictionary containing comprehensive metrics
    """
    try:
        return metrics_collector.get_metrics_summary()
    except Exception as e:
        logger.error(f"❌ Failed to get metrics: {e}")
        return {"error": "Failed to retrieve metrics"}


@router.get("/prometheus")
async def get_prometheus_metrics(
    response: Response,
    current_user=Depends(get_current_user)
):
    """
    Get metrics in Prometheus format.
    
    Returns:
        Prometheus-compatible metrics text
    """
    try:
        metrics = metrics_collector.get_metrics_summary()
        
        # Convert to Prometheus format
        prometheus_metrics = []
        
        # Request metrics
        prometheus_metrics.append(
            f'workspace_requests_total {metrics["requests"]["total"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_requests_avg_response_time {metrics["requests"]["avg_response_time"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_requests_error_rate {metrics["requests"]["error_rate"]}'
        )
        
        # Analysis metrics
        prometheus_metrics.append(
            f'workspace_analysis_total {metrics["analysis"]["total"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_analysis_avg_time {metrics["analysis"]["avg_time"]}'
        )
        
        # Session metrics
        prometheus_metrics.append(
            f'workspace_sessions_created_total {metrics["sessions"]["created"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_sessions_completed_total {metrics["sessions"]["completed"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_sessions_active {metrics["sessions"]["active"]}'
        )
        
        # Performance metrics
        prometheus_metrics.append(
            f'workspace_cache_hit_rate {metrics["performance"]["cache_hit_rate"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_database_operations_total {metrics["performance"]["database_operations"]}'
        )
        
        # Error metrics
        prometheus_metrics.append(
            f'workspace_errors_total {metrics["errors"]["total"]}'
        )
        
        prometheus_metrics.append(
            f'workspace_uptime_seconds {metrics["uptime_seconds"]}'
        )
        
        response.headers["Content-Type"] = "text/plain"
        return "\n".join(prometheus_metrics)
        
    except Exception as e:
        logger.error(f"❌ Failed to generate Prometheus metrics: {e}")
        response.headers["Content-Type"] = "text/plain"
        return "# Error generating metrics"


@router.post("/reset")
async def reset_metrics(current_user=Depends(get_current_user)):
    """
    Reset all metrics (admin only).
    
    Returns:
        Success message
    """
    try:
        metrics_collector.reset_metrics()
        return {"message": "Metrics reset successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to reset metrics: {e}")
        return {"error": "Failed to reset metrics"}


@router.get("/health")
async def get_metrics_health():
    """
    Get health status of metrics collection.
    
    Returns:
        Metrics system health information
    """
    try:
        metrics = metrics_collector.get_metrics_summary()
        
        # Determine health based on error rates and performance
        error_rate = metrics["requests"]["error_rate"]
        avg_response_time = metrics["requests"]["avg_response_time"]
        
        status = "healthy"
        if error_rate > 10:  # More than 10% error rate
            status = "unhealthy"
        elif error_rate > 5 or avg_response_time > 5:  # More than 5% errors or 5s avg response
            status = "degraded"
        
        return {
            "status": status,
            "error_rate": error_rate,
            "avg_response_time": avg_response_time,
            "uptime_seconds": metrics["uptime_seconds"]
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get metrics health: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
