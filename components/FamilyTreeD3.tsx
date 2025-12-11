import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMember } from '../types';

interface FamilyTreeD3Props {
  members: FamilyMember[];
  onSelectMember: (id: string) => void;
}

// Helper to stratify flat data
const buildHierarchy = (members: FamilyMember[]) => {
  if (members.length === 0) return null;
  
  const dataMap = new Map(members.map(m => [m.id, { ...m, children: [] as any[] }]));
  
  let root: any = null;
  
  dataMap.forEach((node) => {
    // Find a parent that exists in the current dataset
    const parentId = node.parents.find(pid => dataMap.has(pid));
    if (parentId) {
        dataMap.get(parentId)?.children.push(node);
    } else {
        // If no parents found in dataset, this is a potential root
        // We prefer the oldest generation as root if multiple exist
        if (!root || (node.generation < root.generation)) {
            root = node;
        }
    }
  });

  // Fallback
  if (!root && members.length > 0) root = dataMap.get(members[0].id);

  return d3.hierarchy(root);
};

// Custom Orthogonal Path Generator (Elbow connector)
const elbowPath = (s: {x: number, y: number}, d: {x: number, y: number}) => {
  return `M ${s.x} ${s.y}
          L ${s.x} ${(s.y + d.y) / 2}
          L ${d.x} ${(s.y + d.y) / 2}
          L ${d.x} ${d.y}`;
};

const FamilyTreeD3: React.FC<FamilyTreeD3Props> = ({ members, onSelectMember }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Constants for Card Design
  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 90;

  useEffect(() => {
    if (wrapperRef.current) {
      setDimensions({
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight || 600
      });
    }
    
    // Resize listener
    const handleResize = () => {
        if (wrapperRef.current) {
            setDimensions({
                width: wrapperRef.current.clientWidth,
                height: wrapperRef.current.clientHeight || 600
            });
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!members.length || dimensions.width === 0) return;

    const root = buildHierarchy(members);
    if (!root) return;

    // Layout configuration
    // x = horizontal spacing between siblings
    // y = vertical spacing between generations
    const treeLayout = d3.tree().nodeSize([CARD_WIDTH + 40, CARD_HEIGHT + 60]);
    treeLayout(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create container group for zoom
    const container = svg.append("g");

    // --- GRID BACKGROUND PATTERN ---
    const defs = svg.append("defs");
    const pattern = defs.append("pattern")
        .attr("id", "grid-pattern")
        .attr("width", 20)
        .attr("height", 20)
        .attr("patternUnits", "userSpaceOnUse");
    pattern.append("circle")
        .attr("cx", 2)
        .attr("cy", 2)
        .attr("r", 1)
        .attr("fill", "#cbd5e1"); // Slate-300 dots

    // Background rect to capture zoom events everywhere
    container.append("rect")
        .attr("width", "100000") // Huge rect
        .attr("height", "100000")
        .attr("x", -50000)
        .attr("y", -50000)
        .attr("fill", "url(#grid-pattern)")
        .attr("opacity", 0.4);

    const g = container.append("g")
        .attr("transform", `translate(${dimensions.width / 2}, 100)`);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    // Initial centering
    svg.call(zoom.transform, d3.zoomIdentity.translate(dimensions.width/2, 50).scale(0.8));

    // --- LINKS (Connectors) ---
    // Use orthogonal paths for that "Mermaid" circuit-board look
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#94a3b8") // Slate-400
      .attr("stroke-width", 2)
      .attr("d", (d: any) => elbowPath(d.source, d.target));

    // --- NODES (Cards) ---
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x - CARD_WIDTH / 2},${d.y - CARD_HEIGHT / 2})`);

    // We use foreignObject to render HTML inside SVG. 
    // This allows easy "Card" styling with Tailwind.
    node.append("foreignObject")
      .attr("width", CARD_WIDTH)
      .attr("height", CARD_HEIGHT)
      .style("overflow", "visible") // Allow shadows to spill out
      .html((d: any) => {
        const member = d.data as FamilyMember;
        const initials = member.name.charAt(0);
        const role = member.attributes.roles[0] || 'Member';
        const year = member.birthDate.split('-')[0];
        
        // Color coding for generations or gender could be added here
        const borderColor = member.gender === 'female' ? 'border-l-pink-400' : 'border-l-blue-400';

        return `
          <div xmlns="http://www.w3.org/1999/xhtml" class="w-full h-full">
             <div class="bg-white rounded-lg shadow-md border border-slate-200 border-l-4 ${borderColor} hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center p-3 h-full group" id="card-${member.id}">
                
                <!-- Avatar -->
                <div class="flex-shrink-0 mr-3">
                   ${member.photoUrl 
                      ? `<img src="${member.photoUrl}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />`
                      : `<div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">${initials}</div>`
                   }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">${member.name}</p>
                    <p class="text-xs text-indigo-600 font-medium truncate uppercase tracking-wider mb-0.5">${role}</p>
                    <p class="text-[10px] text-slate-400 flex items-center">
                       <span class="mr-2">Born ${year}</span>
                    </p>
                </div>

             </div>
          </div>
        `;
      });

    // Attach click listeners to the HTML elements we just created
    // We do this after rendering because foreignObject content isn't standard SVG DOM
    node.each(function(d: any) {
        // We can't easily select the div inside foreignObject via D3 on click immediately 
        // effectively without some trickery, but simpler is to overlay a transparent rect
        // or attach the click to the group.
    });

    // Overlay a transparent rect to ensure clicks are captured easily over the whole area
    node.append("rect")
      .attr("width", CARD_WIDTH)
      .attr("height", CARD_HEIGHT)
      .attr("fill", "transparent")
      .attr("class", "cursor-pointer")
      .on("click", (event, d: any) => {
          event.stopPropagation();
          onSelectMember(d.data.id);
      });

  }, [members, dimensions, onSelectMember]);

  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-50 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Family Map</h3>
            <p className="text-[10px] text-slate-500">Pinch to zoom • Drag to pan</p>
        </div>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
    </div>
  );
};

export default FamilyTreeD3;
