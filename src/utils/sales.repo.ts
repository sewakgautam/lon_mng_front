import { axiosInstance, PaginationType } from "./bridge";

export interface SalesDataType {
  address: string;
  contactNumber: string;
  fullName: string;
  panNo: string;
  goods: FormDataItem[];
  date: "2023-12-29T09:11:31.672Z";
}

export interface FormDataItem {
  description: string;
  rate: number;
  makingCharge: number;
  weight: number;
  mfgCost: number;
  amount: number;
  total: number;
}

export async function fetchSalesData(jwt: string, pagination: PaginationType) {
  return await axiosInstance.get(
    `/sales?page=${+pagination.page}&capacity=${+pagination.capacity}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

export async function deleteSales(salesId: string, jwt: string) {
  return await axiosInstance.delete(`/sales/${salesId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}
export async function sendSalesData(data: SalesDataType, jwt: string) {
  return await axiosInstance.post("/sales", data, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}
