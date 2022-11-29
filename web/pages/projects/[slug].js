import client from "../../client";
import groq from "groq";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText } from "@portabletext/react";
import { useRouter } from "next/router";

function urlFor(source) {
  return imageUrlBuilder(client).image(source);
}

const ptComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <img
          alt={value.alt || " "}
          loading="lazy"
          src={urlFor(value)
            .image(value)
            .width(320)
            .height(240)
            .fit("max")
            .auto("format")}
        />
      );
    },
  },
};

const Projects = ({ projects }) => {
  const router = useRouter();

  if (!router.isFallback && !projects) {
    return <div />;
  }

  if (router.isFallback) {
    return <div />;
  }
  console.log(projects);

  const {
    title = "Missing title",
    name = "Missing name",
    categories,
    authorImage,
    body = [],
  } = projects;
  return (
    <article>
      <h1>{title}</h1>
      <h3>By: {name}</h3>
      {categories && (
        <ul>
          Posted in
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      )}
      {/*om authorImage finns så körs nedanför */}
      {authorImage && (
        <div>
          <img
            src={urlFor(authorImage).width(200).height(200).url()}
            alt={`${name}'s picture`}
          />
        </div>
      )}

      <PortableText value={body} components={ptComponents} />
    </article>
  );
};
//what i want returned from the API call

export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == "projects" && defined(slug.current)][].slug.current
  `
  );
  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  };
}
//what i want returned from the API call
export async function getStaticProps(context) {
  const { slug } = context.params;
  const getDataFromApi = groq`*[_type in ["projects", "post"] && slug.current == "${slug}"][0]{
     _type == "post" => {
  title,
  "name": author->name,
  "categories": categories[]->title,
  "authorImage": author->image,
  body
  },
   _type == "projects" => {
    title
  }
  
}`;

  console.log(getDataFromApi);
  const projects = await client.fetch(getDataFromApi);
  console.log(projects);
  return {
    props: {
      projects,
    },
    notFound: projects ? false : true,
  };
}

export default Projects;
