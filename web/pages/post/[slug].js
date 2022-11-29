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

const Post = ({ post }) => {
  const router = useRouter();

  if (!router.isFallback && !post) {
    return <div />;
  }

  if (router.isFallback) {
    return <div />;
  }
  console.log(post);

  const {
    title = "Missing title",
    name = "Missing name",
    categories,
    authorImage,
    body = [],
  } = post;
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
    `*[_type == "post" && defined(slug.current)][].slug.current
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
  const getDataFromApi = groq`*[_type == "post" && slug.current == "${slug}"][0]{
  title,
  "name": author->name,
  "categories": categories[]->title,
  "authorImage": author->image,
  body
}`;

  console.log(getDataFromApi);
  const post = await client.fetch(getDataFromApi);
  console.log(post);
  return {
    props: {
      post,
    },
    notFound: post ? false : true,
  };
}

export default Post;
