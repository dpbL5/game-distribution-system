import Link from "next/link";

import { gameService } from "@/modules/game";
import { GameCover } from "@/shared/ui/game-cover";
import { formatMoney } from "@/shared/utils/format-money";

export const dynamic = "force-dynamic";

type GamesPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const query = first(params.q);
  const platform = first(params.platform);
  const sort = first(params.sort);
  const page = Number(first(params.page) ?? "1");
  const result = await gameService.listPublished({
    query,
    platform: platform || undefined,
    sort: sort === "name" ? "name" : "newest",
    page: Number.isFinite(page) ? page : 1,
  });

  const buildHref = (pageNumber: number) => {
    const search = new URLSearchParams();
    search.set("page", String(pageNumber));
    if (query) search.set("q", query);
    if (platform) search.set("platform", platform);
    if (sort) search.set("sort", sort);
    return `/games?${search.toString()}`;
  };

  return (
    <main className="main-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CỬA HÀNG</span>
          <h1>Khám phá game</h1>
          <p className="lede">
            Tìm trong danh mục game đã phát hành. Bộ lọc và phân trang được giữ trên URL để có thể
            tải lại đúng trạng thái.
          </p>
        </div>
      </div>
      <form className="filter-bar" method="get">
        <div className="field">
          <label htmlFor="q">Tìm kiếm</label>
          <input id="q" name="q" defaultValue={query} placeholder="Tên game hoặc nhà phát triển" />
        </div>
        <div className="field">
          <label htmlFor="platform">Nền tảng</label>
          <select id="platform" name="platform" defaultValue={first(params.platform) ?? ""}>
            <option value="">Tất cả nền tảng</option>
            <option value="WINDOWS">Windows</option>
            <option value="MACOS">macOS</option>
            <option value="LINUX">Linux</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sắp xếp</label>
          <select id="sort" name="sort" defaultValue={first(params.sort) ?? "newest"}>
            <option value="newest">Mới nhất</option>
            <option value="name">Theo tên</option>
          </select>
        </div>
        <button className="button button-primary" type="submit">
          Áp dụng bộ lọc
        </button>
      </form>
      {result.items.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Không có game đã phát hành nào khớp với tìm kiếm này.</p>
        </div>
      ) : (
        <div className="card-grid">
          {result.items.map((game) => (
            <article className="game-card" key={game.id}>
              <GameCover name={game.name} coverPath={game.coverPath} />
              <div className="game-info">
                <span className="eyebrow">
                  {game.developerName} · {game.releaseDate.getFullYear()}
                </span>
                <h2>{game.name}</h2>
                <p className="muted small clamp">{game.shortDescription}</p>
                {game.categories.length > 0 ? (
                  <div className="tag-row">
                    {game.categories.slice(0, 3).map((category) => (
                      <span className="tag" key={category}>
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="price-row">
                  {game.discountPercent !== "0.00" ? (
                    <span className="price">
                      {formatMoney(game.currentPrice)}{" "}
                      <span className="muted small price-strike">{formatMoney(game.basePrice)}</span>
                    </span>
                  ) : (
                    <span className="price">{formatMoney(game.basePrice)}</span>
                  )}
                  <Link className="button button-secondary" href={`/games/${game.slug}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {result.pageCount > 1 && (
        <nav aria-label="Phân trang game" className="form-actions pagination-actions">
          {result.page > 1 ? (
            <Link className="button button-secondary" href={buildHref(result.page - 1)}>
              Trước
            </Link>
          ) : null}
          {Array.from({ length: result.pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <Link
              className={
                pageNumber === result.page ? "button button-primary" : "button button-secondary"
              }
              href={buildHref(pageNumber)}
              key={pageNumber}
              aria-current={pageNumber === result.page ? "page" : undefined}
            >
              {pageNumber}
            </Link>
          ))}
          {result.page < result.pageCount ? (
            <Link className="button button-secondary" href={buildHref(result.page + 1)}>
              Sau
            </Link>
          ) : null}
        </nav>
      )}
    </main>
  );
}
