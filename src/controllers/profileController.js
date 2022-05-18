import * as env from "../../config";

export const getProfileInfo = async (userId) => {
    try {
        const url = `${env.API_URL}/profile/${userId}`
        const response = await fetch(url)
        const profile = response.json()
        return profile;
    } catch (error) {
        console.log(error)
    }

}

export const addProfileInfo = async (userId, profileInfo) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: profileInfo })
        };
        const url = `${env.API_URL}/profile/${userId}`
        console.log(url)
        console.log(requestOptions)
        const response = await fetch(url, requestOptions);
        const profile = response.json();
        console.log(profile)
        return profile;
    } catch (error) {
        console.log(error)
    }
}

//Arreglar 
export const editProfileInfo = async (userId, profileInfo, docId) => {
    try {
        const { id, ...profile } = profileInfo;
        const requestBody = {
            profile: profileInfo,
            docId: docId
        }
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        console.log(requestBody)
        const url = `${env.API_URL}/profile/${userId}`
        console.log(url)
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}

export const deleteProfileInfo = async (userId, docId) => {
    try {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };
        const url = `${env.API_URL}/profile?userId=${userId}&docId=${docId}`
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}

