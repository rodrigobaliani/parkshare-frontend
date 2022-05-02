import * as env from '../../config';

export const getParkingInstructions = async (mode) => {
  try {
    const url = `${env.API_URL}/parkings/instructions/${mode}`
    const response = await fetch(url);
    const parking = response.json();
    return parking;
  } catch (error) {
    console.log(error);
  }
};



