// export const BACKEND_API =
//   "http://localhost:3000"; // local

// export const BACKEND_API = "http://3.114.26.97:3000"; // aws
export const BACKEND_API = "http://localhost:3000"; // aws
export const FRONTEND_URL = "http://13.48.180.238:4173"; // aws

export const serverDeployStatus = import.meta.env.DEV;

export const xToken =
  "e542e7e001432b6bd1d86011194226b8bfad28f0c646276e96726deb56d91b1a";

export const color = {
  Primary: "#21409A",
  Secondary: "#ED1C24",
  Accent: "#041511",
  Tabs: "#172C69",
  Background: "#15171e",
  Text: "#24514E",
};

export const fonts = {
  regular: "Poppins-Regular",
  bold: "Poppins-Bold",
  medium: "Poppins-Medium",
  light: "Poppins-Light",
};

type MessageType = "warning" | "error" | "success";

export const SERVER_MAINTAINACE = false;
export const WIN_UPDATE_WARNING = false;
export const MAINTAINANCE_MESSAGE: {
  type: MessageType;
  title: string;
  description: string;
} = {
  type: "warning",
  title: "!!! SYSTEM MAINTAINACE  !!!",
  description:
    "We're undergoing system maintenance and calculations might be inaccurate. Our developers are working on a fix, and normal functionality will resume soon. Thanks for your patience!",
};
