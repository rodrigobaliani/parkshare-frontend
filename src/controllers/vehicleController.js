import * as env from "../../config";

export const getCurrentVehicle = async (userId) => {
    try {
        const url = `${env.API_URL}/primary/vehicle/${userId}`
        const response = await fetch(url)
        const vehicle = response.json()
        return vehicle;
    } catch (error) {
        console.log(error)
    }

}

export const addVehicle = async (userId, newVehicle) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicle: newVehicle })
        };
        const url = `${env.API_URL}/vehicles/${userId}`
        const response = await fetch(url, requestOptions);
        const vehicle = response.json();
        return vehicle;
    } catch (error) {
        console.log(error)
    }
}

export const editVehicle = async (userId, newVehicle) => {
    try {
        const { id, ...vehicle } = newVehicle;
        const requestBody = {
            vehicle: vehicle,
            vehicleId: id
        }
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        console.log(requestBody)
        const url = `${env.API_URL}/vehicles/${userId}`
        console.log(url)
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}

export const deleteVehicle = async (userId, vehicleId) => {
    try {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };
        const url = `${env.API_URL}/vehicles?userId=${userId}&vehicleId=${vehicleId}`
        console.log(url)
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}