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

const Pets = ({ pets }) => {
  const router = useRouter();

  if (!router.isFallback && !pets) {
    return <div />;
  }

  if (router.isFallback) {
    return <div />;
  }
  console.log(pets);

  const {
    title = "Missing title",
    name = "Missing name",
    categories,
    body = [],
    nickname,
  } = pets;
  return (
    <article>
      <h1>{title}</h1>
      <h4>My pets name is {nickname}</h4>

      <PortableText value={body} components={ptComponents} />
      <h3>Posted By: {name}</h3>
      {categories && (
        <ul>
          Posted in
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
//what i want returned from the API call

export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == "pets" && defined(slug.current)][].slug.current
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
  const getDataFromApi = groq`*[_type in ["pets"] && slug.current == "${slug}"][0]{
   _type == "pets" => {
    title, _id, slug,
    "name": author->name,
    "authorImage": author->image,
    nickname,
  body,
  "categories": categories[]->title,
  }
  
}`;

  console.log(getDataFromApi);
  const pets = await client.fetch(getDataFromApi);
  console.log(pets);
  return {
    props: {
      pets,
    },
    notFound: pets ? false : true,
  };
}

export default Pets;
