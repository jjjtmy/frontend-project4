import { useState, useEffect } from "react";
import "./AddReviewPage.css";
import {
  Box,
  Text,
  TextInput,
  Textarea,
  Rating,
  Group,
  Fieldset,
} from "@mantine/core";
import { getToken } from "../../util/security.tsx";
import { addVendorReview } from "../../service/vendors.tsx";
import { useLocation } from "react-router-dom";
import useToast from "../../components/useToast.tsx";

export default function AddReviewPage(): JSX.Element {
  const location = useLocation();
  const { vendorName } = location.state || {};
  const [formState, setFormState] = useState({
    Venue: "",
    costperpax: "",
    food: 1,
    ambience: 2,
    preWeddingSupport: 3,
    dayOfSupport: 4,
    overall: 5,
    comments: "",
  });
  const { successToast, errorToast } = useToast();

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      Venue: vendorName || "", // Default to empty string if vendorName is undefined
    }));
  }, [vendorName]);

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        return;
      }
      const review = {
        token: token,
        review: formState,
      };
      console.log(`addreview req`, review);
      const res = await addVendorReview(review);
      console.log("addreview updated successfully:", res);
      successToast({
        title: "Review submitted successfully!",
        message: "Thank you for sharing your experience.",
      });
    } catch (error) {
      console.error("Add review error:", error);
    }
  }

  return (
    <>
      <Box className="FormContainer" w="80vw" style={{ margin: "30px auto" }}>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <TextInput
            label="Venue"
            name="Venue"
            value={formState.Venue}
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
          <TextInput
            label="Cost per pax"
            name="costperpax"
            value={formState.costperpax}
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
          <Fieldset legend="Ratings" c="black" align="left">
            <Group>
              <Text c="black">Food</Text>
              <Rating
                size="lg"
                fractions={2}
                value={formState.food}
                onChange={(newValue) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    food: newValue,
                  }))
                }
              />
            </Group>
            <Group>
              <Text c="black">Ambience</Text>
              <Rating
                size="lg"
                value={formState.ambience}
                onChange={(newValue) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    ambience: newValue,
                  }))
                }
              />
            </Group>
            <Group>
              <Text c="black">Pre-wedding Support</Text>
              <Rating
                size="lg"
                fractions={2}
                value={formState.preWeddingSupport}
                onChange={(newValue) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    preWeddingSupport: newValue,
                  }))
                }
              />
            </Group>
            <Group>
              <Text c="black">Day-of Support</Text>
              <Rating
                size="lg"
                fractions={2}
                value={formState.dayOfSupport}
                onChange={(newValue) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    dayOfSupport: newValue,
                  }))
                }
              />
            </Group>
            <Group>
              <Text c="black">Overall</Text>
              <Rating
                size="lg"
                fractions={2}
                value={formState.overall}
                onChange={(newValue) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    overall: newValue,
                  }))
                }
              />
            </Group>
          </Fieldset>
          <Textarea
            label="Comments"
            name="comments"
            value={formState.comments}
            onChange={handleChange}
            required
            autosize
            minRows={6}
            maxRows={6}
            placeholder="Share your tips and comments here!"
            style={{ width: "100%" }}
          />
          <button type="submit" style={{ margin: "10px auto" }}>
            Submit
          </button>
        </form>
        <p className="error-message">&nbsp;</p>
      </Box>
    </>
  );
}
