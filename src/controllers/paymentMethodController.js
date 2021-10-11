import * as env from "../../config";

export const getCurrentPayment = async (userId) => {
    try {
        const url = `${env.API_URL}/primary/paymentMethod/${userId}`
        const response = await fetch(url)
        const payment = response.json()
        return payment;
    } catch (error) {
        console.log(error)
    }

}

export const getUserPaymentMethods = async (userId) => {
    try {
        const url = `${env.API_URL}/paymentMethods/${userId}`
        const response = await fetch(url)
        const payments = response.json()
        return payments;
    } catch (error) {
        console.log(error)
    }

}

export const addPaymentMethod = async (userId, paymentMethod) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment: paymentMethod })
        };
        const url = `${env.API_URL}/paymentMethods/${userId}`
        const response = await fetch(url, requestOptions);
        const payment = response.json();
        console.log(payment)
        return payment;
    } catch (error) {
        console.log(error)
    }
}

export const editPaymentMethod = async (userId, paymentMethod) => {
    try {
        const { id, ...payment } = paymentMethod;
        const requestBody = {
            payment: payment,
            paymentId: id
        }
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        console.log(requestBody)
        const url = `${env.API_URL}/paymentMethods/${userId}`
        console.log(url)
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {
        console.log(error)
    }
}

export const deletePaymentMethod = async (userId, paymentId) => {
    try {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };
        const url = `${env.API_URL}/paymentMethods?userId=${userId}&paymentId=${paymentId}`
        const response = await fetch(url, requestOptions);
        return response.status;
    } catch (error) {

    }
}

