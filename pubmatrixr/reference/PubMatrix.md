# PubMatrix function

This function takes two vectors A and B, an API key, a database name,
and performs a search operation on the specified database using the
search terms from A and B. It then generates a dataframe of search
results and optionally exports it as a .csv file. Use
plot_pubmatrix_heatmap() to visualize the results as a heatmap.

## Usage

``` r
PubMatrix(
  file,
  A = NULL,
  B = NULL,
  API.key = NULL,
  Database = "pubmed",
  daterange = NULL,
  outfile = NULL
)
```

## Arguments

- file:

  A file containing search terms. If A and B are NULL, search terms will
  be read from this file.

- A:

  A vector of search terms to be paired with B. If NULL, search terms
  will be read from the file.

- B:

  A vector of search terms to be paired with A. If NULL, search terms
  will be read from the file.

- API.key:

  An API key obtained from Entrez; not necessary.

- Database:

  Either 'pubmed' or 'pmc'. Determines the database to search.

- daterange:

  A range of dates to search if desired. Should be a vector of two
  elements: the start and end date.

- outfile:

  A file path to export the search dataframe as a .csv file. If NULL, no
  file will be exported.

## Value

A dataframe of search results. Each element of the dataframe is the
number of search results for a pair of search terms from A and B.

## Examples

``` r
# Note: This example requires internet connection
A <- c("WNT1", "WNT2")
B <- c("FZD1", "FZD2")
# result <- PubMatrix(A = A, B = B, Database = "pubmed", daterange = c(2020, 2023))
# print(result)
message("Example commented out to avoid internet dependency in checks")
#> Example commented out to avoid internet dependency in checks
```
