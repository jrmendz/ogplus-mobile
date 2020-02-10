import axios from "axios";

const axiosConfig = {
    // timeout: 10000,
    baseURL: process.env.VUE_APP_ATHENS_BASEURL,
};
const servitor = axios.create(axiosConfig);

export default servitor;
