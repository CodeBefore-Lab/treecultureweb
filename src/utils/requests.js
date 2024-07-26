// axiosUtils.js

import axios from "axios";

// const BASE_URL = "https://api.pestomat.com/v1/treewebapi/"; // Update this with your backend URL
const BASE_URL = "http://160.20.111.43:3006/api/";

async function sendRequest(method, url, data = null, options = {}, token = null) {
  // Get the token from local storage without ""
  const tokens = localStorage.getItem("token");

  const config = {
    method,
    url: `${BASE_URL}${url}`,
    ...options,
    headers: {
      Authorization: `Bearer ${tokens}`, // Add the token to the request headers
    },
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   console.log("Token expired"); // Add your desired console.log() message here
    // }
    throw new Error(`Failed to ${method} data at ${url}: ${error.message}`);
  }
}

export { sendRequest };
