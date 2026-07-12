import { Fragment } from "react";

type FlowStep = {
  title: string;
  note?: string;
};

type FlowLane = {
  label: string;
  steps: FlowStep[];
};

type FlowDiagramProps = {
  lanes: FlowLane[];
};

function FlowArrow() {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center text-ink-muted"
    >
      <span className="sm:hidden">↓</span>
      <span className="hidden sm:inline">→</span>
    </span>
  );
}

function FlowNode({ title, note }: FlowStep) {
  return (
    <div className="min-w-0 flex-1 rounded-md border border-surface bg-bg px-4 py-3 text-center">
      <p className="break-words text-sm font-medium leading-snug text-ink">
        {title}
      </p>
      {note ? (
        <p className="mt-1 break-words text-xs leading-snug text-ink-muted">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Architecture diagram used in case-study MDX bodies: one or more labeled
 * lanes, each a chain of step nodes connected by arrows. Desktop lays lanes
 * out horizontally (arrows point right); below `sm` they stack vertically
 * (arrows point down). Pure HTML/CSS — nodes shrink and wrap their text
 * instead of overflowing the viewport.
 */
export function FlowDiagram({ lanes }: FlowDiagramProps) {
  return (
    <div className="flex flex-col gap-7 rounded-lg border border-surface bg-surface/30 p-5 sm:p-6">
      {lanes.map((lane) => (
        <div key={lane.label} className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            {lane.label}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {lane.steps.map((step, index) => (
              <Fragment key={`${lane.label}-${step.title}-${index}`}>
                <FlowNode title={step.title} note={step.note} />
                {index < lane.steps.length - 1 ? <FlowArrow /> : null}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
