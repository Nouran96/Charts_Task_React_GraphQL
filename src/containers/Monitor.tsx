import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Box, Typography } from "@mui/material";
import ApexCharts from "apexcharts";
import Tree from "../components/Tree";
import CustomAppBar from "../components/CustomAppBar";
import NodeDetails from "../components/NodeDetails";
import styles from "./styles.module.css";

const Monitor = () => {
  const { pathname } = useLocation();
  const [title, setTitle] = useState("");

  useEffect(() => {
    const title = pathname.split("/").join("");
    setTitle(title ? title.slice(0, 1).toUpperCase() + title.slice(1) : title);
  }, [pathname]);

  return (
    <Box className={styles.monitorContainer}>
      <Box className={styles.firstColumnContainer}>
        <Typography
          sx={{ color: "#3535a9", textTransform: "uppercase" }}
          borderBottom="1px solid black"
          px={2}
          gutterBottom
          variant="subtitle2"
        >
          The World
        </Typography>

        <Box px={2}>
          <Tree />
        </Box>
      </Box>

      <Box className={styles.secondColumnContainer}>
        <CustomAppBar title={title} />

        <NodeDetails />
      </Box>

      <Box className={styles.thirdColumnContainer}>Hii</Box>
    </Box>
  );
};

export default Monitor;
