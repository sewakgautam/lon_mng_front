import axios, { AxiosError, AxiosResponse } from "axios";
import { BACKEND_API } from "../../config";
import { dhitoAddDatatype, lilamiDataType } from "../Pages/UserProfile";

export interface CustomerDataType {
  phoneNumber: string;
  altPhoneNumber: string;
  fullName: string;
  address: string;
  image: string;
}

export interface PaginationType {
  page: number;
  capacity: number;
}

export const axiosInstance = axios.create({
  baseURL: BACKEND_API,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

export async function login() {
  return await axiosInstance.get("/login");
}

// fetch the use session

export async function sessionUser(jwt: string) {
  const res = await axiosInstance.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  return res;
}

// fetch the customer data

export async function fetchUsers(
  jwt: string,
  pagination: PaginationType,
  searchValue?: string
) {
  return await axiosInstance.get(
    `/customers?page=${pagination.page}&capacity=${pagination.capacity}&search=${searchValue}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

export async function postNewImage(data: FormData, jwt: string) {
  return await axiosInstance.post(`/image-upload`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function fetchDashboard(jwt: string) {
  return await axiosInstance.get("/dashboard", {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

// edit customer
export async function editCustomer(
  customerId: string,
  Data: CustomerDataType,
  jwt: string
) {
  return await axiosInstance.patch(`/customers/${customerId}`, Data, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function Payment(
  dhittoId: string,
  userId: string,
  bsDate: string,
  amount: { amount: number },
  jwt: string
) {
  return await axiosInstance.post(
    `/customers/${userId}/dhittos/${dhittoId}/statements`,
    { amount: +amount.amount, bsDate },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

//add customers

export async function addCustomer(data: CustomerDataType, jwt: string) {
  console.log("this is data", data);
  return await axiosInstance.post(`/customers`, data, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function deleteCustomer(customerId: string, jwt: string) {
  return await axiosInstance.delete(`/customers/${customerId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

//fetch the eachUser Info

export async function fetchCustomerInfo(
  customerId: string,
  jwt: string,
  pagination: PaginationType
) {
  return await axiosInstance.get(
    `/customers/${customerId}?page=${+pagination.page}&capacity=${+pagination.capacity}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

export async function fetchCustomerHistory(data: {
  customerId: string;
  startDate: Date;
  endDate: Date;
}) {
  const { customerId, startDate, endDate } = data;
  return await axiosInstance.post("customers/customer/history", {
    customerId,
    startDate,
    endDate,
  });
}

// add Dhito Data
export async function addDhitoOfCustomer(
  data: dhitoAddDatatype,
  customerId: string,
  jwt: string
) {
  console.log("inside", customerId);
  return await axiosInstance.post(`/customers/${customerId}/dhittos`, data, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

// fetch the sales data

export async function burner(id: string, jwt: string) {
  return await axiosInstance.get(`/uploads/burner/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

// lilami
export async function addLilami(data: lilamiDataType, jwt: string) {
  const dataManagement = {
    ...data,
    date: new Date(data.date.adDate),
    bsDate: data.date.bsDate!,
  };
  return await axiosInstance.post("/lilami", dataManagement, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

export async function fetchLilami(jwt: string, pagination: PaginationType) {
  return await axiosInstance.get(
    `/lilami?page=${+pagination.page}&capacity=${+pagination.capacity}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}
export async function deleteLilami(id: string, jwt: string) {
  return await axiosInstance.delete(`/lilami/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}
