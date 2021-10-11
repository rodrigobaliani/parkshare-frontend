import * as env from "../../config"

export const addColabParking = async (colabParking) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parking: colabParking })
        };
        const url = `${env.API_URL}/parkings/colab`
        const response = await fetch(url, requestOptions);
        const parking = response.json();
        return parking;
    } catch (error) {
        console.log(error)
    }
}

export const editColabParking = async (parkingId, parking) => {
    try {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parking: parking })
        };
        const url = `${env.API_URL}/parkings/colab/${parkingId}`
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}

export const deleteColabParking = async (parkingId) => {
    try {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };
        const url = `${env.API_URL}/parkings/colab/${parkingId}`
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}