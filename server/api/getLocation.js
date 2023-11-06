export default defineEventHandler(async (event) => {
  try {
    const { q } = getQuery(event);

    if (!q) {
      return { statusCode: 400, data: "Bad Request" };
    }

    // fetch nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json`
    );

    const data = await response.json();

    if (!data.length) {
      return { statusCode: 404, data: "Not Found" };
    }

    // return only 5 results
    return {
      statusCode: 200,
      message: "Success",
      data: data.slice(0, 5),
    };
  } catch (error) {
    console.log(error);
  }
});
