import { createFileRoute, notFound } from "@tanstack/react-router";
import { PAGES, type PageSlug } from "@/lib/pages";

export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug as PageSlug];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Vakinha` },
          { name: "description", content: loaderData.body[0] },
          { property: "og:title", content: `${loaderData.title} — Vakinha` },
          { property: "og:description", content: loaderData.body[0] },
        ]
      : [{ title: "Página indisponível — Vakinha" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const page = Route.useLoaderData();
  return (
    <article className="container-page max-w-3xl py-14">
      <h1 className="text-4xl font-extrabold">{page.title}</h1>
      <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
        {page.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </article>
  );
}
