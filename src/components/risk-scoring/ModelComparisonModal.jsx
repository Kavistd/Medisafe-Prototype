import { GitMerge, Cpu, BarChart3, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'

const METRICS = [
  { metric: 'Accuracy', xgb: '94.2%', rf: '92.8%', ensemble: '95.6%' },
  { metric: 'ROC-AUC', xgb: '0.971', rf: '0.958', ensemble: '0.982' },
  { metric: 'Precision (High-Risk)', xgb: '93.5%', rf: '91.2%', ensemble: '94.8%' },
  { metric: 'Recall (High-Risk)', xgb: '95.0%', rf: '94.1%', ensemble: '96.3%' },
  { metric: 'F1-Score', xgb: '0.942', rf: '0.926', ensemble: '0.955' },
  { metric: 'Inference Latency', xgb: '12 ms', rf: '18 ms', ensemble: '24 ms' },
]

const HYPERPARAMETERS = [
  { param: 'Model Type', xgb: 'Gradient Boosted Decision Trees', rf: 'Bagged Ensemble of Decision Trees' },
  { param: 'Estimators', xgb: '300 trees', rf: '500 trees' },
  { param: 'Max Depth', xgb: '6', rf: 'None (until pure)' },
  { param: 'Learning Rate / Feature Sampling', xgb: 'eta = 0.05', rf: 'max_features = sqrt(n)' },
  { param: 'Objective / Loss', xgb: 'binary:logistic', rf: 'Gini Impurity / Log Loss' },
  { param: 'SHAP Compatibility', xgb: 'TreeExplainer (Exact)', rf: 'TreeExplainer (Exact)' },
]

const FEATURE_IMPORTANCES = [
  { feature: 'Manufacturer Historical Compliance', importance: 34, xgb: 36, rf: 32 },
  { feature: 'Dosage Strength Deviation', importance: 26, xgb: 28, rf: 24 },
  { feature: 'Therapeutic Classification Consistency', importance: 18, xgb: 17, rf: 19 },
  { feature: 'Clinical Indication Profile', importance: 13, xgb: 11, rf: 15 },
  { feature: 'Dosage Form Regularity', importance: 9, xgb: 8, rf: 10 },
]

export default function ModelComparisonModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Machine Learning Model Comparison"
      description="Comparative analysis of the XGBoost and Random Forest architectures powering the medicine risk scoring ensemble."
      size="xl"
    >
      <div className="space-y-5">
        {/* Ensemble Summary Banner */}
        <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/80 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <GitMerge size={20} />
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-brand-900">Ensemble Architecture: XGBoost (55%) + Random Forest (45%)</h4>
            <p className="mt-0.5 text-xs text-brand-700">
              The dual-model ensemble leverages gradient boosting's fast boundary optimization alongside random forest's variance reduction for robust counterfeit and abnormality detection.
            </p>
          </div>
        </div>

        {/* Validation Performance Metrics */}
        <div>
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-brand-600" />
            Validation Performance Metrics
          </h5>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Evaluation Metric</th>
                  <th className="px-4 py-2.5">XGBoost (55%)</th>
                  <th className="px-4 py-2.5">Random Forest (45%)</th>
                  <th className="px-4 py-2.5 text-brand-700">Ensemble Combined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {METRICS.map((m) => (
                  <tr key={m.metric} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-sans font-medium text-slate-800">{m.metric}</td>
                    <td className="px-4 py-2 text-slate-600">{m.xgb}</td>
                    <td className="px-4 py-2 text-slate-600">{m.rf}</td>
                    <td className="px-4 py-2 font-semibold text-brand-700">{m.ensemble}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hyperparameters & Specifications */}
        <div>
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
            <Cpu size={14} className="text-brand-600" />
            Model Specifications & Hyperparameters
          </h5>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Parameter</th>
                  <th className="px-4 py-2.5">XGBoost</th>
                  <th className="px-4 py-2.5">Random Forest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HYPERPARAMETERS.map((h) => (
                  <tr key={h.param} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-medium text-slate-800">{h.param}</td>
                    <td className="px-4 py-2 font-mono text-slate-600">{h.xgb}</td>
                    <td className="px-4 py-2 font-mono text-slate-600">{h.rf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Breakdown */}
        <div>
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Feature Importance Distribution (Gini / Gain)</h5>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {FEATURE_IMPORTANCES.map((f) => (
              <div key={f.feature} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{f.feature}</span>
                  <span className="font-mono text-slate-500">{f.importance}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${f.importance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

