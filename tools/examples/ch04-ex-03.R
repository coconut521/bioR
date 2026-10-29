library(readxl)
excel_sheets(here::here("assets/data/pika_lab_notebook.xlsx"))
incidents <- read_excel(here::here("assets/data/pika_lab_notebook.xlsx"),
                        sheet = "incidents")
incidents
