# AI Knowledge Sharing Presentation Templates

This repository contains multiple RMarkdown presentation templates using `revealjs::revealjs_presentation` for an AI Knowledge Sharing series. Each template demonstrates different design approaches and features of revealjs presentations.

## Available Templates

1. **Modern Theme** (`session-one-modern.Rmd`)
   - Clean, professional design with gradient backgrounds
   - Interactive elements and animations
   - Timeline layouts and graphical elements
   - Custom CSS in `custom.css`

2. **Minimalist Theme** (`session-one-minimalist.Rmd`)
   - Elegant, simple design with ample whitespace
   - Typography-focused presentation
   - Subtle animations and transitions
   - Custom CSS in `minimalist.css`

3. **Interactive Theme** (`session-one-interactive.Rmd`)
   - Highly interactive with embedded demos
   - JavaScript interactivity with user inputs
   - Real-time visualization examples
   - Custom CSS and JS in `interactive.css` and `header.html`

4. **Data-Focused Theme** (`session-one-data-focused.Rmd`)
   - Designed for data presentations with charts and tables
   - Multi-column layouts for data visualization
   - Analytics dashboard styling
   - Custom CSS in `data-focused.css`

## How to Use

1. Clone this repository
2. Open the desired `.Rmd` file in RStudio
3. Install required packages if needed:
   ```r
   install.packages(c("revealjs", "tidyverse", "plotly", "gganimate", "DT"))
   ```
4. Click "Knit" to generate the HTML presentation

## Customizing the Templates

Each template can be customized by:
- Modifying the YAML header for different revealjs options
- Editing the CSS files to change colors, fonts, and styling
- Adding your own content while maintaining the layout structure
- Incorporating additional JavaScript in the header.html file

## Advanced Features Demonstrated

- Custom slide transitions and backgrounds
- Interactive data visualizations with plotly
- CSS animations and effects
- JavaScript integrations
- Responsive layouts
- Speaker notes
- Slide navigation options
- Custom CSS for print formatting

## Requirements

- R and RStudio
- revealjs package
- Various R packages for data visualization (see each .Rmd file for specific requirements)

## License

These templates are provided as open-source examples for educational purposes.

## Credits

Created by Claude AI based on best practices from various revealjs presentations.