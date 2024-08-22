import "./VendorPage.css";
import { Box, Button } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVendorPage } from "../../service/vendors";
import { addToWishlist } from "../../service/users";
import NavBar from "../../components/NavBar";

export default function VendorPage() {
  // const fetchData await getVendorPage(vendor) try catch fnally
  const { vendorID } = useParams();
  const [vendorDetails, setVendorDetails] = useState(null);

  async function fetchData() {
    try {
      const vendor = await getVendorPage(vendorID);
      console.log(`vendorpage vendor`, vendor);
      setVendorDetails(vendor);
    } catch {
      console.error("Error fetching vendor details", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [vendorID]);

  if (!vendorDetails) {
    return <div>Loading...</div>;
  }

  const handleLike = (event) => {
    event.preventDefault();
    addToWishlist(vendorID);
  };

  return (
    <>
      <NavBar />
      <Box className="vendorContainer">
        <Box className="image">IMAGE GOES HERE</Box>
        <div className="details">
          <Button onClick={handleLike}>Like</Button>
          <Box fw={700}>{vendorDetails.Name}</Box>
          <Box> {vendorDetails.Description}</Box>
          <Box>
            <p>
              Capacity: {vendorDetails.MinCap} to
              {vendorDetails.MaxCap}
            </p>
            <p>
              Price: {vendorDetails.MinPrice} to {vendorDetails.MaxPrice}
            </p>
          </Box>
          <Box>
            <p>Location: {vendorDetails.Location}</p>
            <p>Email: {vendorDetails.Email}</p>
            <p>Phone: {vendorDetails.Phone}</p>
          </Box>
          <Box className="reviews">
            Reviews
            {vendorDetails.reviews.map((review) => (
              <div>
                <p>{review.username} said:</p>
                <p>Cost per pax: {review.costperpax}</p>
                <p>Food: {review.food}</p>
                <p>Ambience: {review.ambience}</p>
                <p>Pre-wedding support: {review.preWeddingSupport}</p>
                <p>Day-of support: {review.dayOfSupport}</p>
                <p>Overall: {review.overall}</p>
                <p>Comments: {review.comments}</p>
              </div>
            ))}
          </Box>
        </div>
      </Box>
    </>
  );
}
