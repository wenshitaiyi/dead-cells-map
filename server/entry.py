"""
dead_cells_map - 死亡细胞交互地图子服务
静态站点（Next.js 静态导出）+ 中英双语叠加层。

前端产物位于 ./dist/。两种托管方式均兼容：
1) 完整服务器启动时，由 ui_service 自动挂载到 /ui/dead_cells_map/；
2) 单独参数化启动（--services dead_cells_map）时，本入口自行挂载静态目录。
HTML 内资源已改写为相对路径，因此在任意子路径下均可正常加载。
"""

from pathlib import Path
from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles

router = APIRouter(prefix="/api/dead_cells_map", tags=["死亡细胞交互地图"])
_log = None
_ctx = None

# 静态目录（与本文件相对：server/../dist）
_DIST = Path(__file__).resolve().parent.parent / "dist"


async def start(ctx):
    """子服务生命周期启动入口"""
    global _ctx, _log
    _ctx = ctx
    _log = ctx.plugins["logger"].get_logger(ctx.service_name)

    app = ctx.plugins.get("web_app")
    if app:
        app.include_router(router)
        # 自托管静态前端（保证单独启动时也可访问）
        if _DIST.is_dir() and (_DIST / "index.html").exists():
            app.mount("/dead_cells_map", StaticFiles(directory=str(_DIST), html=True),
                      name="dead_cells_map_static")
            _log.info(f"已自挂载静态前端: /dead_cells_map/ <- {_DIST}")

    _log.info("子服务 dead_cells_map (Dead Cells Interactive Map) 启动成功")


@router.get("/ping", summary="服务健康检查")
async def ping():
    return {"status": "online", "service": "dead_cells_map"}
