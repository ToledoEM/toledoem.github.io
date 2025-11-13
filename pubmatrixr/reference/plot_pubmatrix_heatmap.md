# Create a formatted heatmap from PubMatrix results

This function creates a heatmap displaying Jaccard distance values
calculated from a PubMatrix result matrix, with Euclidean distance
clustering for rows and columns.

## Usage

``` r
plot_pubmatrix_heatmap(
  matrix,
  title = "PubMatrix Co-occurrence Heatmap",
  cluster_rows = TRUE,
  cluster_cols = TRUE,
  show_numbers = TRUE,
  color_palette = NULL,
  filename = NULL,
  width = 10,
  height = 8
)
```

## Arguments

- matrix:

  A numeric matrix from PubMatrix results containing publication
  co-occurrence counts

- title:

  Character string for the heatmap title. Default is "PubMatrix
  Co-occurrence Heatmap"

- cluster_rows:

  Logical value determining if rows should be clustered using Euclidean
  distance. Default is TRUE

- cluster_cols:

  Logical value determining if columns should be clustered using
  Euclidean distance. Default is TRUE

- show_numbers:

  Logical value determining if Jaccard distance values should be
  displayed in cells. Default is TRUE

- color_palette:

  Color palette for the heatmap. Default uses a red gradient color scale

- filename:

  Optional filename to save the heatmap. If NULL, displays the plot

- width:

  Width of saved plot in inches. Default is 10

- height:

  Height of saved plot in inches. Default is 8

## Value

A pheatmap object (invisible)

## Details

The function displays Jaccard distance values in the heatmap cells (same
as compute_jaccard_matrix) and uses Euclidean distance for clustering
rows and columns. Jaccard distance is calculated as 1 -
(intersection/union) where intersection is the number of common non-zero
elements and union is the total number of non-zero elements. NA values
in the input matrix are converted to 0 before calculation to ensure
stability.

## Examples

``` r
if (FALSE) { # \dontrun{
# First run PubMatrix
result <- PubMatrix(A = c("gene1", "gene2"), B = c("disease1", "disease2"))

# Create heatmap
plot_pubmatrix_heatmap(result)

# Save to file
plot_pubmatrix_heatmap(result, filename = "my_heatmap.png")
} # }
```
