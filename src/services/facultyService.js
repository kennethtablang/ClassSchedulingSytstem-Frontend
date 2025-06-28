import axios from "./axiosInstance";

export const getFacultyUsers = () => axios.get("/faculty");
