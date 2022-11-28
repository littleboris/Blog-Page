import sanityClient from "@sanity/client";

export default sanityClient({
  projectId: "u0k1jrjk",
  dataset: "production",
  useCdn: false,
});
