import axios, { AxiosError, AxiosResponse } from "axios";
import { BACKEND_API } from "../../config";
import { PaginationType } from "./bridge";

export interface BankRecordDataTypes {
  id: string;
  bankName: string;
  productName: string;
  percentage: number;
  status: string;
  createdDate: string;
  Bank: {
    id: string;
    name: string;
    address: string;
  };
}

export interface BankDataTypes {
  id?: string;
  name: string;
  address: string;
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

export async function fetchBankRecords(
  jwt: string,
  pagination: PaginationType,
  searchValue?: string,
  bankId?: string
) {
  return await axiosInstance.get(
    `/banks/bank-records?page=${+pagination.page}&capacity=${+pagination.capacity}&search=${searchValue}&bankId=${bankId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}
export async function deleteBankRecords(
  bankId: string,
  bankrecordsId: string,
  jwt: string
) {
  return await axiosInstance.delete(
    `/banks/${bankId}/bank-records/${bankrecordsId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}
export async function createBankRecords(
  data: BankRecordDataTypes,
  jwt: string
) {
  return await axiosInstance.post("/banks/bank-records", data, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function updateBankRecord(
  bankId: string,
  bankrecordsId: string,
  Data: Partial<BankRecordDataTypes>,
  jwt: string
) {
  return await axiosInstance.patch(
    `/banks/${bankId}/bank-records/${bankrecordsId}`,
    Data,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

export async function fetchBank(jwt: string) {
  return await axiosInstance.get(`/banks`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function createBank(bankData: BankDataTypes, jwt: string) {
  return await axiosInstance.post("/banks", bankData, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

export async function deleteBank(bankId: string, jwt: string) {
  return await axiosInstance.delete(`/banks/${bankId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}
