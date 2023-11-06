export default defineEventHandler(async (event) => {
  try {
    // Get useStorage
    const storage = await useStorage("tunnel");

    // Get url from storage
    const url = await storage.getItem("url");

    if (!url) {
      return { statusCode: 404, data: "Not Found" };
    }

    return {
      statusCode: 200,
      message: "Success",
      data: url,
    };
  } catch (error) {
    console.log(error);
  }
});
