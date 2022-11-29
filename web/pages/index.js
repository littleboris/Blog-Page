import Link from "next/link";
import groq from "groq";
import client from "../client";

const Index = ({ posts, projects }) => {
  return (
    <div>
      <h1>Welcome to a blog!</h1>
      {posts.length > 0 &&
        posts.map(
          ({ _id, title = "", slug = "", publishedAt = "" }) =>
            slug && (
              <li key={_id}>
                <Link href="/post/[slug]" as={`/post/${slug.current}`}>
                  <a>{title}</a>
                </Link>{" "}
                ({new Date(publishedAt).toDateString()})
              </li>
            )
        )}
    </div>
  );
};

const Projects = ({ projects }) => {
  return (
    <div>
      <h1>Projects so far</h1>
      {projects.length > 0 &&
        projects.map(
          ({ title = "", slug = "" }) =>
            slug && (
              <Link href="./projects/[slug]" as={`/projects/${slug.current}`}>
                <h1>{title}</h1>
              </Link>
            )
        )}
    </div>
  );
};

export async function getStaticProps() {
  const posts = await client.fetch(groq`
      *[_type == ["post", "projects"] && publishedAt < now()] | order(publishedAt desc)
    `);
  return {
    props: {
      posts,
      // projects,
    },
  };
}

export default Index;
