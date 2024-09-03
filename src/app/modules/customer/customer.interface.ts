interface name {
  firstName: string;
  lastName: string;
}

interface location {
  coordiantes: [number];
  type: string;
}

export interface Icustomer {
  name: name;
  address: string;
  location: location;
  image: string;
  isDeleted: boolean;
}
