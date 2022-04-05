import * as env from '../../config';

export const getParkingInstructions1 = async (from, to) => {
  try {
    const url = `${env.API_URL}/parkings/instructions1?fromIndex=${from}&toIndex=${to}`;
    console.log(url);
    const response = await fetch(url);
    const parking = response.json();
    return parking;
  } catch (error) {
    console.log(error);
  }
};

export const getParkingInstructions2 = async (from, to) => {
  try {
    const url = `${env.API_URL}/parkings/instructions2?fromIndex=${from}&toIndex=${to}`;
    console.log(url);
    const response = await fetch(url);
    const parking = response.json();
    return parking;
  } catch (error) {
    console.log(error);
  }
};

export const getParkingInstructions3 = async (from, to) => {
  try {
    const url = `${env.API_URL}/parkings/instructions3?fromIndex=${from}&toIndex=${to}`;
    console.log(url);
    const response = await fetch(url);
    const parking = response.json();
    return parking;
  } catch (error) {
    console.log(error);
  }
};

export const getParkingInstructions4 = async (from, to) => {
  try {
    const url = `${env.API_URL}/parkings/instructions4?fromIndex=${from}&toIndex=${to}`;
    console.log(url);
    const response = await fetch(url);
    const parking = response.json();
    return parking;
  } catch (error) {
    console.log(error);
  }
};


