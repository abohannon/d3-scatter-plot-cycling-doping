/* global d3:true */
/* eslint no-undef: "error" */

const app = (data) => {
  // Set chart dimensions
  const w = 850
  const h = 550
  const padding = 100

  // create svg canvas
  const svg = d3.select('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'chart')

  // x scale and axis
  const minSeconds = d3.min(data, (d) => d.Seconds)
  const maxSeconds = d3.max(data, (d) => d.Seconds)

  const xScale = d3.scaleLinear()
    .domain([
      maxSeconds + 5 - minSeconds,
      0
    ])
    .range([padding, w - padding])

  const xAxis = d3.axisBottom(xScale)

  svg.append('g')
    .attr('transform', `translate(0, ${h - padding})`)
    .call(xAxis)

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', w / 2)
    .attr('y', h - padding / 2)
    .attr('class', 'chart-label')
    .text('Seconds Behind Leader')

  // y scale and axis
  const yScale = d3.scaleLinear()
    .domain([d3.max(data, (d) => d.Place) + 2, 1])
    .range([h - padding, padding])

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => d)

  svg.append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .call(yAxis)

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${padding / 2}, ${h / 2})rotate(-90)`)
    .attr('class', 'chart-label')
    .text('Rank')

  // create tooltip div
  const tooltip = d3.select('body').append('div')
    .attr('class', 'chart-tooltip')
    .style('opacity', 0)

  // plot the data
  svg.selectAll('.circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('cx', (d, i) => xScale(d.Seconds - minSeconds))
    .attr('cy', (d, i) => yScale(d.Place))
    .attr('r', 5)
    .classed('red', (d) => d.Doping.length > 0) // needed to add & not replace class
    .classed('blue', (d) => !d.Doping.length > 0)
    .on('mouseover', (d) => {
      tooltip
        .transition()
        .style('opacity', 1)
      tooltip
        .html(`
          <div><b>${d.Name}</b></div>
          <div>${d.Time} / ${d.Year}</div>
          <div>${d.Doping}</div>
          `)
        .style('left', xScale(d.Seconds - minSeconds - 15) + 'px')
        .style('top', yScale(d.Place) + 'px')
    })
    .on('mouseout', () => {
      tooltip
        .transition()
        .style('opacity', 0)
    })

  // chart title
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', w / 2)
    .attr('y', padding / 2)
    .attr('class', 'chart-title')
    .text(`Doping in Professional Cycling: Le Tour de France at Alpe d'Huez`)

  // chart legend
  svg.append('circle')
    .classed('red', true)
    .attr('cx', w - 300)
    .attr('cy', 350)
    .attr('r', 5)

  svg.append('text')
    .text('Doping allegations')
    .attr('x', w - 280)
    .attr('y', 355)
    .attr('class', 'chart-legend-label')

  svg.append('circle')
    .classed('blue', true)
    .attr('cx', w - 300)
    .attr('cy', 375)
    .attr('r', 5)

  svg.append('text')
    .text('No doping allegations')
    .attr('x', w - 280)
    .attr('y', 380)
    .attr('class', 'chart-legend-label')
}

// Fetch the data and pass it into the app, else throw an error if promise is rejected

const dataURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json'

fetch(dataURL)
  .then((response) => {
    if (response.status !== 200) {
      console.log('There was a problem with the response', response)
    } else {
      return response.json()
    }
  })
  .then((data) => app(data))
  .catch((error) => {
    console.log(error)
    console.log('There was a problem. Promise rejected.')
  })
