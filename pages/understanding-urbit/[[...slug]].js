import Head from "next/head";
import Meta from "../../components/Meta";
import Link from "next/link";
import { useRouter } from "next/router";
import classnames from "classnames";
import { join } from "path";
import { getPage, getPreviousPost, getNextPost } from "../../lib/lib";
import Markdown from "../../components/Markdown";
import ContentArea from "../../components/ContentArea";
import Sidebar from "../../components/Sidebar";
import Pagination from "../../components/Pagination";
import UnderstandingUrbitTree from "../../cache/understanding-urbit.json";

import { decode } from "html-entities";

const breadcrumbs = (posts, paths) => {
  const results = [
    <Link href="/">Urbit</Link>,
    <span className="px-1">/</span>,
    <Link href="/understanding-urbit">Understanding Urbit</Link>,
  ];
  let thisLink = "/understanding-urbit";
  for (const path of paths) {
    posts = posts.children[path];
    thisLink = join(thisLink, path);
    results.push(
      <span className="px-1">/</span>,
      <Link href={thisLink}>{posts.title}</Link>
    );
  }
  return results;
};

const childPages = (thisLink, children, level = 0) => (
  <ul>
    {children?.map((child) => (
      <li>{pageTree(join(thisLink, child.slug), child, level)}</li>
    ))}
  </ul>
);

const pageTree = (thisLink, tree, level = 0) => {
  const router = useRouter();

  const isThisPage = router.asPath === thisLink;

  const pageItemClasses = classnames({
    "pl-4 text-base hover:text-green-400": level === 0,
    "pl-8 text-base hover:text-green-400": level === 1,
    "pl-12 text-base hover:text-green-400": level === 2,
    "dot relative text-green-400": isThisPage,
    "text-wall-600": !isThisPage,
  });

  return (
    <>
      <Link href={thisLink} passHref>
        <a className={`${pageItemClasses} cursor-pointer`}>{tree.title}</a>
      </Link>
    </>
  );
};

export default function UnderstandingLayout({
  posts,
  data,
  params,
  search,
  markdown,
  previousPost,
  nextPost,
}) {
  const router = useRouter();
  const isSelected = "/understanding-urbit".includes(router.asPath);
  const selectedClasses = classnames({
    dot: isSelected,
    "text-green-400": isSelected,
    "text-wall-600": !isSelected,
  });
  const rootClasses = "pl-4 text-base hover:text-green-400";
  return (
    <>
      <Head>
        <title>{data.title} • Understanding Urbit • urbit.org</title>
        {Meta(data)}
      </Head>
      <div className="flex h-screen min-h-screen w-screen sidebar">
        <Sidebar search={search}>
          <ul>
            <li>
              <Link href="/understanding-urbit" passHref>
                <a className={`relative ${selectedClasses} ${rootClasses}`}>
                  Introduction
                </a>
              </Link>
            </li>
          </ul>
          {childPages("/understanding-urbit", posts.pages)}
        </Sidebar>
        <ContentArea
          breadcrumbs={breadcrumbs(posts, params.slug?.slice(0, -1) || "")}
          title={data.title}
          search={search}
          section={"Understanding Urbit"}
          params={params}
        >
          <div className="markdown">
            <article
              dangerouslySetInnerHTML={{ __html: decode(markdown) }}
            ></article>
          </div>
          <div className="flex justify-between mt-16">
            {previousPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                previous
                title="Previous Post"
                post={previousPost}
                className=""
                section={join(
                  "understanding-urbit",
                  params.slug?.slice(0, -1).join("/")
                )}
              />
            )}
            {nextPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                next
                title="Next Post"
                post={nextPost}
                className=""
                section={join(
                  "understanding-urbit",
                  params.slug?.slice(0, -1).join("/")
                )}
              />
            )}
          </div>
        </ContentArea>
      </div>
    </>
  );
}

export async function getStaticProps({ params }) {
  const posts = UnderstandingUrbitTree;

  const { data, content } = getPage(
    join(
      process.cwd(),
      "content/understanding-urbit",
      params.slug?.join("/") || "/"
    )
  );

  const previousPost =
    getPreviousPost(
      params.slug?.slice(-1).join("") || "understanding-urbit",
      ["title", "slug", "weight"],
      join("understanding-urbit", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const nextPost =
    getNextPost(
      params.slug?.slice(-1).join("") || "understanding-urbit",
      ["title", "slug", "weight"],
      join("understanding-urbit", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const markdown = await Markdown({ post: { content: content } });

  return { props: { posts, data, markdown, params, previousPost, nextPost } };
}

export async function getStaticPaths() {
  const posts = UnderstandingUrbitTree;

  const slugs = [];

  const allHrefs = (thisLink, tree) => {
    slugs.push(thisLink, ...tree.pages.map((e) => join(thisLink, e.slug)));
    allHrefsChildren(thisLink, tree.children);
  };

  const allHrefsChildren = (thisLink, children) => {
    Object.entries(children).map(([childSlug, child]) => {
      allHrefs(join(thisLink, childSlug), child);
    });
  };

  allHrefs("/understanding-urbit", posts);

  return {
    paths: slugs,
    fallback: false,
  };
}
