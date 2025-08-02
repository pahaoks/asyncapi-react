import React, { useState, useEffect } from 'react';
import { MessageInterface, SchemaInterface } from '@asyncapi/parser';

import { CollapseButton, JSONSnippet } from '../../components';
import { MessageHelpers } from '../../helpers/message';
import { MessageExample as MessageExampleType } from '../../types';
import { useConfig } from '../../contexts';

interface Props {
  message: MessageInterface;
  channelName: string;
}

export const MessageExample: React.FunctionComponent<Props> = ({ message, channelName }) => {
  if (!message) {
    return null;
  }

  const payload = message.payload();
  const headers = message.headers();

  return (
    <div className="bg-gray-800 px-8 py-4 mt-4 -mx-8 2xl:mx-0 2xl:px-4 2xl:rounded examples">
      <h4 className="text-white text-lg">Examples</h4>
      {payload && (
        <Example
          type="Payload"
          schema={payload}
          examples={MessageHelpers.getPayloadExamples(message)}
        />
      )}
      {headers && (
        <Example
          type="Headers"
          schema={headers}
          examples={MessageHelpers.getHeadersExamples(message)}
        />
      )}
      {payload && (
        <Try
            type="Try"
            channelName={channelName}
            schemaMessage={payload}
            schemaHeaders={headers}
            examples={MessageHelpers.getPayloadExamples(message)}
            headers={MessageHelpers.getHeadersExamples(message)}
        />
      )}
    </div>
  );
};

interface ExampleProps {
  type: 'Payload' | 'Headers';
  schema: SchemaInterface;
  examples?: MessageExampleType[];
}

export const Example: React.FunctionComponent<ExampleProps> = ({
  type = 'Payload',
  schema,
  examples = [],
}) => {
  const config = useConfig();
  const [expanded, setExpanded] = useState(
    config?.expand?.messageExamples ?? false,
  );

  useEffect(() => {
    setExpanded(config?.expand?.messageExamples ?? false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.expand]);

  return (
    <div className="mt-4">
      <div>
        <CollapseButton
          onClick={() => setExpanded((prev) => !prev)}
          expanded={expanded}
          chevronProps={{
            className: 'fill-current text-gray-200',
          }}
        >
          <span className="inline-block w-20 py-0.5 mr-1 text-gray-200 text-sm border text-center rounded focus:outline-none">
            {type}
          </span>
        </CollapseButton>
      </div>
      <div className={expanded ? 'block' : 'hidden'}>
        {examples && examples.length > 0 ? (
          <ul>
            {examples.map((example, idx) => (
              <li className="mt-4" key={idx}>
                <h5 className="text-xs font-bold text-gray-500">
                  {example.name
                    ? `#${idx + 1} Example - ${example.name}`
                    : `#${idx + 1} Example`}
                </h5>
                {example.summary && (
                  <p className="text-xs font-bold text-gray-500">
                    {example.summary}
                  </p>
                )}
                <div className="mt-1">
                  <JSONSnippet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    snippet={MessageHelpers.sanitizeExample(example.example)}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <JSONSnippet
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              snippet={MessageHelpers.generateExample(schema.json())}
            />
            <h6 className="text-xs font-bold text-gray-600 italic mt-2">
              This example has been generated automatically.
            </h6>
          </div>
        )}
      </div>
    </div>
  );
};

interface TryProps {
  type: 'Try';
  channelName: string;
  schemaMessage: SchemaInterface;
  schemaHeaders?: SchemaInterface;
  examples?: MessageExampleType[];
  headers?: MessageExampleType[];
}

export const Try: React.FunctionComponent<TryProps> = ({
  type = 'Try',
  channelName,
  schemaMessage,
  schemaHeaders,
  examples = [],
  headers = [],
}) => {
  const config = useConfig();
  const [expanded, setExpanded] = useState(
    config?.expand?.messageExamples ?? false,
  );

  useEffect(() => {
    setExpanded(config?.expand?.messageExamples ?? false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.expand]);

  return (
    <div className="mt-4">
      <div>
        <CollapseButton
          onClick={() => setExpanded((prev) => !prev)}
          expanded={expanded}
          chevronProps={{
            className: 'fill-current text-gray-200',
          }}
        >
          <span className="inline-block w-20 py-0.5 mr-1 text-gray-200 text-sm border text-center rounded focus:outline-none">
            {type}
          </span>
        </CollapseButton>
      </div>
      <div className={expanded ? 'block' : 'hidden'}>
        {examples && examples.length > 0 ? (
          <ul>
            {examples.map((example, idx) => (
              <li className="mt-4" key={idx}>
                <h5 className="text-xs font-bold text-gray-500">
                  {example.name
                    ? `#${idx + 1} Example - ${example.name}`
                    : `#${idx + 1} Example`}
                </h5>
                {example.summary && (
                  <p className="text-xs font-bold text-gray-500">
                    {example.summary}
                  </p>
                )}
                <TryForm 
                  routingKey={channelName}
                  header={JSON.stringify(headers && headers?.length > 0 ? headers[0].example : {}, null, 2)} 
                  example={JSON.stringify(example, null, 2)} 
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <TryForm 
              routingKey={channelName}
              header={schemaHeaders ? JSON.stringify(MessageHelpers.generateExample(schemaHeaders.json()), null, 2) : '{}'} 
              example={JSON.stringify(MessageHelpers.generateExample(schemaMessage.json()), null, 2)} 
            />
            <h6 className="text-xs font-bold text-gray-600 italic mt-2">
              This example has been generated automatically.
            </h6>
          </div>
        )}
      </div>
    </div>
  );
};

interface TryFormProps {
  header: string;
  example: string;
  routingKey: string;
}

export const TryForm: React.FunctionComponent<TryFormProps> = ({ header, example, routingKey }) => {
  const headerObj = JSON.parse(header || '{}');
  const exampleObj = JSON.parse(example || '{}');
  const obj = {
    routingKey: routingKey || '',
    headers: headerObj,
    payload: exampleObj,
  }

  const config = useConfig();
  const host = config?.try?.host || window.location.protocol + '//' + window.location.host;
  const path = config?.try?.path || '';

  const [state, updateState] = useState({
    url: host + path,
    login: config?.try?.login || 'login',
    password: config?.try?.password || 'password',
    message: JSON.stringify(obj, null, 2),
  });

  return (
    <form>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Url
        </label>
        <input 
          type="text" 
          defaultValue={state.url} 
          className="border rounded p-1 w-full" 
          onChange={(e) => updateState({ ...state, url: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Login
        </label>
        <input 
          type="text" 
          defaultValue={state.login} 
          onChange={(e) => updateState({ ...state, login: e.target.value })}
          className="border rounded p-1 w-full" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Password
        </label>
        <input 
          type="text" 
          defaultValue={state.password}
          onChange={(e) => updateState({ ...state, password: e.target.value })}
          className="border rounded p-1 w-full" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Message
        </label>
        <textarea 
          id="story" 
          name="story" 
          rows={15} 
          cols={35} 
          className="border rounded p-1 w-full" 
          value={state.message}
          onChange={(e) => updateState({ ...state, message: e.target.value })}>
        </textarea>
      </div>
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async (e) => {
          e.preventDefault();

          try {
            JSON.parse(state.message)
            const resp = await fetch(state.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(state.login + ':' + state.password)
              },
              body: state.message,
            });

            if (!resp.ok) {
              const errorText = await resp.text();
              alert(`Error: ${errorText}`);
              return;
            }

            const responseData = await resp.json();
            alert(`Message sent successfully! Response: ${JSON.stringify(responseData, null, 2)}`);
          } catch (e: any) {
            alert(e.message || 'An error occurred while sending the message.');
            throw e;
          }
        }}
      >
        Send Message
      </button>
    </form>
  );
};
