import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LineChart from "../LineChart";
import { useAppSelector } from "../../types/Redux";
import moment from "moment";
import styles from "./styles.module.css";
import { Box } from "@mui/system";
import { getWeatherHistoryData } from "../../network/apiCalls";

type HistoryWeatherResponse = {
  hourly: Array<{
    dt: number;
    temp: number;
  }>;
};

const TempChart = () => {
  const {
    weather: { requestedParams },
    tree: { selectedNode },
  } = useAppSelector((state) => state);

  const [history, setHistory] = React.useState<{
    data: null | Array<HistoryWeatherResponse>;
    error: null | boolean;
    loading: boolean;
  }>({ data: null, error: null, loading: false });

  const [lineChartData, setLineChartData] = React.useState<Array<{
    dt: number;
    temp: number;
  }> | null>(null);

  React.useEffect(() => {
    if (requestedParams.dt) {
      getWeatherHistory();
    }
  }, [requestedParams]);

  React.useEffect(() => {
    if (history.data) getChartData();
  }, [history]);

  React.useEffect(() => {
    setLineChartData(null);

    setHistory({ data: null, error: null, loading: false });
  }, [selectedNode]);

  const getWeatherHistory = async () => {
    setHistory({ data: null, error: null, loading: true });
    try {
      if (requestedParams) {
        // Unix timestamp in seconds 24 hours before
        const unixTimestampADayBefore =
          requestedParams.dt && requestedParams.dt - 86400;

        const dayBeforeData =
          requestedParams.coord &&
          unixTimestampADayBefore &&
          (await getWeatherHistoryData(
            requestedParams.coord.lat,
            requestedParams.coord.lon,
            unixTimestampADayBefore
          ));

        const todayData =
          requestedParams.coord &&
          requestedParams.dt &&
          (await getWeatherHistoryData(
            requestedParams.coord.lat,
            requestedParams.coord.lon,
            requestedParams.dt
          ));

        if (
          (dayBeforeData.cod && dayBeforeData.cod !== 200) ||
          (todayData.cod && todayData.cod !== 200)
        ) {
          // Error happened
          setHistory({ data: null, error: true, loading: false });
        } else {
          setHistory({
            data: [dayBeforeData, todayData],
            error: null,
            loading: false,
          });
        }
      }
    } catch (err: any) {
      setHistory({ data: null, error: true, loading: false });
    }
  };

  const getChartData = () => {
    if (requestedParams.dt && history.data) {
      // Find the exact hour in 24 hours format a day ago from requested weather date time
      const timeIn24HoursFormatADayBefore: number = +moment
        .unix(requestedParams.dt - 86400)
        .utc()
        .format("HH");

      const weatherData24HoursBefore =
        history.data[0].hourly[timeIn24HoursFormatADayBefore];

      // Get 12 hours before data from yesterday response if present else from today's response
      const weatherData12HoursBefore =
        timeIn24HoursFormatADayBefore + 12 <= 23 // last index is 23
          ? history.data[0].hourly[timeIn24HoursFormatADayBefore + 12]
          : history.data[1].hourly[timeIn24HoursFormatADayBefore + 12 - 24]; // subtract 24 to start from 0 again

      // Get 6 hours before data from yesterday response if present else from today's response
      const weatherData6HoursBefore =
        timeIn24HoursFormatADayBefore + 18 <= 23 // last index is 23
          ? history.data[0].hourly[timeIn24HoursFormatADayBefore + 18]
          : history.data[1].hourly[timeIn24HoursFormatADayBefore + 18 - 24]; // subtract 24 to start from 0 again

      setLineChartData([
        weatherData24HoursBefore,
        weatherData12HoursBefore,
        weatherData6HoursBefore,
      ]);
    }
  };

  return (
    <div>
      <Accordion
        classes={{ root: styles.accordion, expanded: styles.expandedAccordion }}
      >
        <Card sx={{ padding: 0, marginBottom: 1 }}>
          <CardContent sx={{ padding: 0, paddingBottom: "0 !important" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              classes={{
                root: styles.accordionSummary,
                content: styles.accordionSummaryContent,
              }}
            >
              <Typography
                sx={{ color: "var(--main-color)", textTransform: "uppercase" }}
                variant="subtitle2"
                py={1}
                fontWeight={700}
              >
                Temperature
              </Typography>
            </AccordionSummary>
          </CardContent>
        </Card>

        <AccordionDetails>
          {history.loading ? (
            <Box display="flex" justifyContent="center" mt={10}>
              <CircularProgress />
            </Box>
          ) : history.error ? (
            <Typography textAlign="center" className="error">
              Error fetching weather history
            </Typography>
          ) : lineChartData ? (
            <>
              <LineChart data={lineChartData} />
            </>
          ) : (
            <Typography textAlign="center" className="error">
              No weather history found
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default TempChart;
