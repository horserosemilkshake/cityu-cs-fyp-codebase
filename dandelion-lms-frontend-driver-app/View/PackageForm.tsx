import React, { useState } from 'react';

interface PackageFormData {
  id: string;
  packageId: string;
  packageDescription: string;
  packageWeight: number;
  packageHeight: number;
  packageLength: number;
  packageWidth: number;
  senderName: string;
  recipientName: string;
  pickupLocation: string;
  pickupCoordinate: string;
  destination: string;
  destinationCoordinate: string;
}

const PackageForm: React.FC = () => {
  const [formData, setFormData] = useState<PackageFormData>({
    id: '',
    packageId: '',
    packageDescription: '',
    packageWeight: 0,
    packageHeight: 0,
    packageLength: 0,
    packageWidth: 0,
    senderName: '',
    recipientName: '',
    pickupLocation: '',
    pickupCoordinate: '',
    destination: '',
    destinationCoordinate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="id"
        placeholder="ID"
        value={formData.id}
        onChange={handleChange}
      />
      <input
        type="text"
        name="packageId"
        placeholder="Package ID"
        value={formData.packageId}
        onChange={handleChange}
      />
      <input
        type="text"
        name="packageDescription"
        placeholder="Package Description"
        value={formData.packageDescription}
        onChange={handleChange}
      />
      <input
        type="number"
        name="packageWeight"
        placeholder="Package Weight (kg)"
        value={formData.packageWeight}
        onChange={handleChange}
      />
      <input
        type="number"
        name="packageHeight"
        placeholder="Package Height"
        value={formData.packageHeight}
        onChange={handleChange}
      />
      <input
        type="number"
        name="packageLength"
        placeholder="Package Length"
        value={formData.packageLength}
        onChange={handleChange}
      />
      <input
        type="number"
        name="packageWidth"
        placeholder="Package Width"
        value={formData.packageWidth}
        onChange={handleChange}
      />
      <input
        type="text"
        name="senderName"
        placeholder="Sender Name"
        value={formData.senderName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="recipientName"
        placeholder="Recipient Name"
        value={formData.recipientName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="pickupLocation"
        placeholder="Pickup Location"
        value={formData.pickupLocation}
        onChange={handleChange}
      />
      <input
        type="text"
        name="pickupCoordinate"
        placeholder="Pickup Coordinate"
        value={formData.pickupCoordinate}
        onChange={handleChange}
      />
      <input
        type="text"
        name="destination"
        placeholder="Destination"
        value={formData.destination}
        onChange={handleChange}
      />
      <input
        type="text"
        name="destinationCoordinate"
        placeholder="Destination Coordinate"
        value={formData.destinationCoordinate}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PackageForm;