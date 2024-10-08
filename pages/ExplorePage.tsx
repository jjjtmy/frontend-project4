import { useEffect, useState } from "react";
import "./ExplorePage.css";
import { getVendorNames, getVendorByName } from "../service/vendors";
import {
  Box,
  Autocomplete,
  AutocompleteProps,
  Avatar,
  Group,
  Text,
  RangeSlider,
  Accordion,
  Pagination,
  Radio,
} from "@mantine/core";
import VendorCard from "../components/VendorCard";

export default function ExplorePage() {
  const [vendors, setVendors] = useState([]); //vendor names to autopopulate search bar
  const [formState, setFormState] = useState(""); //search bar
  const [searchResult, setSearchResult] = useState(null); //result from search bar
  const [allVendors, setAllVendors] = useState([]); //all vendors when page loads
  const [filteredVendors, setFilteredVendors] = useState([]); //filtered vendors
  const [priceFilter, setPriceFilter] = useState([0, 500]);
  const [capFilter, setCapFilter] = useState([0, 500]);
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");
  const [overallRatingFilter, setOverallRatingFilter] = useState([1, 5]);
  const [foodRatingFilter, setFoodRatingFilter] = useState([1, 5]);
  const [ambienceRatingFilter, setAmbienceRatingFilter] = useState([1, 5]);
  const [preWeddingSupportRatingFilter, setPreWeddingSupportRatingFilter] =
    useState([1, 5]);
  const [dayOfSupportRatingFilter, setDayOfSupportRatingFilter] = useState([
    1, 5,
  ]);
  const [filterApplied, setFilterApplied] = useState(false); // track if filter is applied
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch vendor names and then all vendors
        const vendorNames = await getVendorNames();
        const vendorNamelist = vendorNames.data.map((vendor) => vendor.Name);
        setVendors(vendorNamelist);

        const vendorPromises = vendorNamelist.map(async (vendor) => {
          return await getVendorByName(vendor);
        });
        const allVendors = await Promise.all(vendorPromises);
        setAllVendors(allVendors);
        console.log("allVendors", allVendors);
      } catch (error) {
        console.error("Error fetching vendors", error);
      }
    };
    fetchInitialData();
  }, []);

  // Get image URL or return a default if not available
  const getImage = (vendor) => {
    const foundVendor = allVendors.find((v) => v.Name === vendor);
    return foundVendor?.image_url || "default-avatar.png"; // Add a fallback image
  };

  const getLocation = (vendor) => {
    const foundVendor = allVendors.find((v) => v.Name === vendor);
    console.log("foundVendor", foundVendor);
    return foundVendor?.Location || "Location not available";
  };

  const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({
    option,
  }) => (
    <Group gap="sm">
      <Avatar src={getImage(option.value)} size={36} radius="xl" />
      <div>
        <Text size="sm" align="left">
          {option.value}
        </Text>
        <Text size="sm" opacity={0.8} align="left">
          {getLocation(option.value)}
        </Text>
      </div>
    </Group>
  );

  //handle submit for search bar
  async function handleSubmit(evt: React.FormEvent) {
    try {
      evt.preventDefault();
      const result = await getVendorByName(formState);
      console.log("getVendorByName result", result);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
    }
  }

  //when filter changes, filter vendors
  async function submitFilters() {
    setFilterApplied(true);

    const filteredVendors = allVendors.filter((vendor) => {
      // Check if a filter is applied for each criteria, otherwise skip that filter
      const matchesCapacity =
        (capFilter[0] === 0 && capFilter[1] === 500) || // No filter applied
        ((vendor.MinCap as number) >= capFilter[0] &&
          (vendor.MaxCap as number) <= capFilter[1]);

      const matchesPrice =
        (priceFilter[0] === 0 && priceFilter[1] === 500) || // No filter applied
        ((vendor.MinPrice as number) >= priceFilter[0] &&
          (vendor.MaxPrice as number) <= priceFilter[1]);

      const matchesOverallRating =
        (overallRatingFilter[0] === 1 && overallRatingFilter[1] === 5) || // No filter applied
        ((vendor.overallRating as number) >= overallRatingFilter[0] &&
          (vendor.overallRating as number) <= overallRatingFilter[1]);

      const matchesFoodRating =
        (foodRatingFilter[0] === 1 && foodRatingFilter[1] === 5) || // No filter applied
        ((vendor.foodRating as number) >= foodRatingFilter[0] &&
          (vendor.foodRating as number) <= foodRatingFilter[1]);

      const matchesAmbienceRating =
        (ambienceRatingFilter[0] === 1 && ambienceRatingFilter[1] === 5) || // No filter applied
        ((vendor.ambienceRating as number) >= ambienceRatingFilter[0] &&
          (vendor.ambienceRating as number) <= ambienceRatingFilter[1]);

      const matchesPreWeddingSupport =
        (preWeddingSupportRatingFilter[0] === 1 &&
          preWeddingSupportRatingFilter[1] === 5) || // No filter applied
        ((vendor.preWeddingSupportRating as number) >=
          preWeddingSupportRatingFilter[0] &&
          (vendor.preWeddingSupportRating as number) <=
            preWeddingSupportRatingFilter[1]);

      const matchesDayOfSupport =
        (dayOfSupportRatingFilter[0] === 1 &&
          dayOfSupportRatingFilter[1] === 5) || // No filter applied
        ((vendor.dayOfSupportRating as number) >= dayOfSupportRatingFilter[0] &&
          (vendor.dayOfSupportRating as number) <= dayOfSupportRatingFilter[1]);

      const matchesVendorType =
        vendorTypeFilter.length === 0 || // No filter applied
        vendorTypeFilter === vendor.VendorType;

      // Only include vendors that match all the selected filters
      return (
        matchesCapacity &&
        matchesPrice &&
        matchesOverallRating &&
        matchesFoodRating &&
        matchesAmbienceRating &&
        matchesPreWeddingSupport &&
        matchesDayOfSupport &&
        matchesVendorType
      );
    });

    console.log("filteredVendors", filteredVendors);
    setFilteredVendors(filteredVendors);
  }

  //function to paginate the vendors based on the active page
  function paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  const handleVendorTypeFilter = (event) => {
    setVendorTypeFilter(event.target.value);
  };

  return (
    <>
      <div className="explorePage">
        <form className="searchBar" onSubmit={handleSubmit}>
          <Autocomplete
            renderOption={renderAutocompleteOption}
            placeholder="Enter a venue name"
            data={vendors}
            onChange={setFormState}
            maxDropdownHeight={300}
          />
          <button
            className="button"
            type="submit"
            style={{ fontSize: "16px", padding: "1px 6px" }}
          >
            Go
          </button>
        </form>

        {searchResult ? null : (
          <>
            <Accordion variant="contained" style={{ margin: "30px" }}>
              <Accordion.Item value="photos">
                <Accordion.Control>Filters</Accordion.Control>
                <Accordion.Panel>
                  <Box className="filters">
                    <Radio.Group label="Vendor Type" w="100%">
                      <Group mt="xs" mb="lg">
                        <Radio
                          value="Venue"
                          label="Venue"
                          color="#f4a69a"
                          onChange={handleVendorTypeFilter}
                        />
                        <Radio
                          value="Photographer/Videographer"
                          label="Photographer/Videographer"
                          color="#f4a69a"
                          onChange={handleVendorTypeFilter}
                        />
                        <Radio
                          value="Hair and Makeup"
                          label="Hair and Makeup"
                          color="#f4a69a"
                          onChange={handleVendorTypeFilter}
                        />
                        <Radio
                          value="Entertainment"
                          label="Entertainment"
                          color="#f4a69a"
                          onChange={handleVendorTypeFilter}
                        />
                      </Group>
                    </Radio.Group>
                    <div className="ratingFilters">
                      <Text size="m" fw={700} mb={0} align="left" ml={10}>
                        Overall Rating
                      </Text>
                      <RangeSlider
                        minRange={1}
                        min={0}
                        max={5}
                        step={0.5}
                        label={(value) => `${value} stars`}
                        onChange={(value) => setOverallRatingFilter(value)}
                        color="#84A59D"
                        styles={{
                          bar: {
                            padding: "0",
                            height: "6px",
                          },
                          track: {
                            padding: "0",
                            height: "6px",
                          },
                        }}
                      />
                      <Text size="sm" mb={10}>
                        {overallRatingFilter[0]} to {overallRatingFilter[1]}{" "}
                        stars
                      </Text>

                      {vendorTypeFilter === "Venue" && (
                        <>
                          <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                            Food Rating
                          </Text>
                          <RangeSlider
                            minRange={1}
                            min={0}
                            max={5}
                            step={0.5}
                            label={(value) => `${value} stars`}
                            onChange={(value) => setFoodRatingFilter(value)}
                            color="#84A59D"
                            m={6}
                            styles={{
                              bar: {
                                padding: "0",
                                height: "6px",
                              },
                              track: {
                                padding: "0",
                                height: "6px",
                              },
                            }}
                          />
                          <Text size="sm" mb={10}>
                            {foodRatingFilter[0]} to {foodRatingFilter[1]} stars
                          </Text>
                          <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                            Ambience Rating
                          </Text>
                          <RangeSlider
                            minRange={1}
                            min={0}
                            max={5}
                            step={0.5}
                            label={(value) => `${value} stars`}
                            onChange={(value) => setAmbienceRatingFilter(value)}
                            color="#84A59D"
                            m={6}
                            styles={{
                              bar: {
                                padding: "0",
                                height: "6px",
                              },
                              track: {
                                padding: "0",
                                height: "6px",
                              },
                            }}
                          />
                          <Text size="sm" mb={10}>
                            {ambienceRatingFilter[0]} to{" "}
                            {ambienceRatingFilter[1]} stars
                          </Text>
                          <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                            Pre-wedding Support Rating
                          </Text>
                          <RangeSlider
                            minRange={1}
                            min={0}
                            max={5}
                            step={0.5}
                            label={(value) => `${value} stars`}
                            onChange={(value) =>
                              setPreWeddingSupportRatingFilter(value)
                            }
                            color="#84A59D"
                            m={6}
                            styles={{
                              bar: {
                                padding: "0",
                                height: "6px",
                              },
                              track: {
                                padding: "0",
                                height: "6px",
                              },
                            }}
                          />
                          <Text size="sm" mb={10}>
                            {preWeddingSupportRatingFilter[0]} to{" "}
                            {preWeddingSupportRatingFilter[1]} stars
                          </Text>
                          <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                            Day-of Support Rating
                          </Text>
                          <RangeSlider
                            minRange={1}
                            min={0}
                            max={5}
                            step={0.5}
                            label={(value) => `${value} stars`}
                            onChange={(value) =>
                              setDayOfSupportRatingFilter(value)
                            }
                            color="#84A59D"
                            m={6}
                            styles={{
                              bar: {
                                padding: "0",
                                height: "6px",
                              },
                              track: {
                                padding: "0",
                                height: "6px",
                              },
                            }}
                          />
                          <Text size="sm" mb={10}>
                            {dayOfSupportRatingFilter[0]} to{" "}
                            {dayOfSupportRatingFilter[1]} stars
                          </Text>

                          <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                            Capacity
                          </Text>
                          <RangeSlider
                            defaultValue={[0, 500]}
                            min={0}
                            max={500}
                            step={50}
                            label={(value) => `${value} pax`}
                            onChange={(value) => setCapFilter(value)}
                            color="#84A59D"
                            m={6}
                            styles={{
                              bar: {
                                padding: "0",
                                height: "6px",
                              },
                              track: {
                                padding: "0",
                                height: "6px",
                              },
                            }}
                          />
                          <Text size="sm" mb={10}>
                            {capFilter[0]} to {capFilter[1]} pax
                          </Text>
                        </>
                      )}
                    </div>

                    <div className="capAndPriceFilters">
                      <Text size="m" fw={700} mb={-10} align="left" ml={10}>
                        Price per pax
                      </Text>
                      <RangeSlider
                        defaultValue={[0, 500]}
                        min={0}
                        max={500}
                        step={50}
                        label={(value) => `$${value}`}
                        onChange={(value) => setPriceFilter(value)}
                        color="#84A59D"
                        m={6}
                        styles={{
                          bar: {
                            padding: "0",
                            height: "6px",
                          },
                          track: {
                            padding: "0",
                            height: "6px",
                          },
                        }}
                      />
                      <Text size="sm" mb={10}>
                        ${priceFilter[0]} to ${priceFilter[1]}
                      </Text>
                    </div>
                  </Box>
                  <button
                    className="button"
                    onClick={submitFilters}
                    mt={10}
                    style={{ fontSize: "16px", padding: "1px 8px" }}
                  >
                    Filter
                  </button>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </>
        )}

        <Box className="vendorcardgrid">
          {searchResult ? (
            <VendorCard vendor={searchResult} />
          ) : filterApplied && filteredVendors.length === 0 ? (
            <Text>No results found</Text>
          ) : (
            paginate(
              filteredVendors.length > 0 ? filteredVendors : allVendors,
              itemsPerPage,
              activePage
            ).map((vendor, index) => <VendorCard key={index} vendor={vendor} />)
          )}
        </Box>
        <Pagination
          total={Math.ceil(
            (filteredVendors.length > 0 ? filteredVendors : allVendors).length /
              itemsPerPage
          )}
          value={activePage}
          onChange={setActivePage}
          mt="sm"
        />
      </div>
    </>
  );
}
