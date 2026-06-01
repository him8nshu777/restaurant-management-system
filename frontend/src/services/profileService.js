import axiosInstance from "../api/axios";

// ==========================================
// GET PROFILE
// ==========================================
export const getProfile = async () => {

    const response =
        await axiosInstance.get(
            "/auth/profile/"
        );

    return response.data;
};


// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (
    data
) => {

    const response =
        await axiosInstance.patch(
            "/auth/profile/",
            data
        );

    return response.data;
};

export const getAddresses =
    async () => {

        const response =
            await axiosInstance.get(
                "/auth/profile/addresses/"
            );

        return response.data;
    };


export const createAddress =
    async (data) => {

        const response =
            await axiosInstance.post(
                "/auth/profile/addresses/",
                data
            );

        return response.data;
    };


export const updateAddress =
    async (
        id,
        data
    ) => {

        const response =
            await axiosInstance.patch(
                `/auth/profile/addresses/${id}/`,
                data
            );

        return response.data;
    };


export const deleteAddress =
    async (id) => {

        const response =
            await axiosInstance.delete(
                `/auth/profile/addresses/${id}/`
            );

        return response.data;
    };