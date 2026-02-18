# GZ Generator V24 Evan Modified Version

[English Version](README_EN.md) | [中文版](README.md)

## Version Information
- Current Version: V1.1
- Release Date: 2026-02-18

## Version Change Log

### V1.1 Changes (2026-02-18)
1. **Country Data Loading Optimization**
   - Changed loading status text to "国家数据加载中..."
   - Added 10-second timeout mechanism, directly read local files when backend server connection times out
   - Optimized local file reading logic, tried multiple possible paths
   - Embedded complete country data into dataop.js file as backup data source
   - Modified error handling logic, used built-in complete country data when all attempts fail

2. **Data Content Correction**
   - Removed "Taiwan" and "Taipei" related entries to ensure data accuracy

3. **System Stability Improvement**
   - Enhanced error handling and log output for easier troubleshooting
   - Optimized caching mechanism to improve data loading speed

### V1.0 Changes
1. **Core Principle**
   - No changes to functional logic, file references, or data storage addresses—focus solely on UI/UX enhancements

2. **UI Visual Upgrade**
   - Adopted a consistent dark theme with CSS variables for color standardization, plus gradient backgrounds and subtle textures to enhance visual depth
   - Refined card-based layout, buttons, and form elements (inputs, dropdowns, sliders) with unified borders, rounded corners, and shadow effects
   - Applied gradient text for headings and visual indicators for info sections to boost professional aesthetics

3. **UX Improvements**
   - Added rich interactive feedback (hover lift, shadow transitions, scaling effects) for buttons, sliders, and form elements
   - Implemented tooltips for intuitive operation guidance; added hover states for the canvas and preview areas for clearer interaction feedback

4. **Layout & Responsiveness Optimization**
   - Utilized Flexbox and percentage-based widths to optimize element spacing and reduce visual clutter
   - Integrated media queries to enable vertical layout adaptation on mobile devices, preventing overflow on small screens and improving cross-device compatibility

5. **Redundant Content Removal**
   - Eliminated unnecessary acknowledgment sections to streamline the interface

## Usage Instructions
1. Open `GZ头像制作器Evan版.html` file
2. Click "选择文件" button to upload image
3. Adjust image size and position
4. Set player name, nationality, potential, etc.
5. Click "点击生成" button to generate image
6. Right-click the generated image and select "Save image as" to save the image

## Technology Stack
- HTML5
- CSS3
- JavaScript
- jQuery
- cropit.js

## Project Structure
- `GZ头像制作器Evan版.html` - Main page
- `Data/` - Country data files
- `dist/` - Third-party libraries
- `filter/` - Filters and icons
- `font/` - Font files
- `images/` - Image resources
- `src/` - Source code files

## Acknowledgments
- Created by: Mr.Potato
- Thanks to: FMGUNZO
- Chinese localization & second modification: Karnas
- Third modification: Evan Luo

## License
This project is licensed under the MIT License - see the LICENSE file for details

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Issues
If you encounter any issues, please open an issue on GitHub.

## Star History
[![Star History Chart](https://api.star-history.com/svg?repos=Evanluo060810/GunzoFaces-Evan-ui&type=Date)](https://star-history.com/#Evanluo060810/GunzoFaces-Evan-ui&Date)

## Stats
![GitHub stars](https://img.shields.io/github/stars/Evanluo060810/GunzoFaces-Evan-ui.svg?style=social)
![GitHub forks](https://img.shields.io/github/forks/Evanluo060810/GunzoFaces-Evan-ui.svg?style=social)
![GitHub issues](https://img.shields.io/github/issues/Evanluo060810/GunzoFaces-Evan-ui.svg)
![GitHub license](https://img.shields.io/github/license/Evanluo060810/GunzoFaces-Evan-ui.svg)