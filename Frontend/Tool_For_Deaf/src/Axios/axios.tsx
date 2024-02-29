import axios from "axios";


const API = axios.create({
    baseURL: "https://api-inference.huggingface.co/models"
});

export default API;
