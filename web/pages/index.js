import Link from "next/link";
import groq from "groq";
import client from "../client";

const Index = ({ posts, projects, pets }) => {
  console.log(pets);
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
      <div>
        <h1>My Projects - ({projects.length})</h1>
        {projects.length > 0 &&
          projects.map(
            ({ _id, title = "", slug = "" }) =>
              slug && (
                <li key={_id}>
                  <Link
                    href="/projects/[slug]"
                    as={`/projects/${slug.current}`}
                  >
                    <a>{title}</a>
                  </Link>{" "}
                </li>
              )
          )}
      </div>

      <div>
        <h1>My Pets - ({pets.length})</h1>
        {pets.length > 0 &&
          pets.map(
            ({ _id, title = "", slug = "", nickname = "" }) =>
              slug && (
                <li key={_id}>
                  <Link href="/pets/[slug]" as={`/pets/${slug.current}`}>
                    <a>{title}</a>
                  </Link>{" "}
                </li>
              )
          )}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const posts = await client.fetch(groq`
      *[_type == "post" && publishedAt < now()] | order(publishedAt desc)
    `);
  console.log(posts);
  const projects = await client.fetch(groq`
  *[_type == "projects"]{title, _id, slug}
  `);
  console.log(projects);

  const pets = await client.fetch(groq`
  *[_type == "pets"]{title, _id, slug, nickname}
  `);

  return {
    props: {
      posts,
      projects,
      pets,
    },
  };
}

export default Index;
