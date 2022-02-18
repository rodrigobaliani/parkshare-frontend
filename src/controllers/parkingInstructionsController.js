import * as env from "../../config"

export const getParkingInstructions = async () => {
    try {
        const url = `${env.API_URL}/parkings/instructions`
        const response = await fetch(url);
        const parking = response.json();
        return parking;
    } catch (error) {
        console.log(error)
    }
}
