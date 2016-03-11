<?php

namespace Stripe;

class CollectionTest extends TestCase
{
    private function pageableModelResponse($ids, $hasMore)
    {
        $data = array();
        foreach ($ids as $id) {
            array_push($data, array(
                'id' => $id,
                'object' => 'pageablemodel'
            ));
        }
        return array(
            'object' => 'list',
            'url' => '/v1/pageablemodels',
            'data' => $data,
            'has_more' => $hasMore
        );
    }

    public function testAutoPagingOnePage()
    {
        $collection = Collection::constructFrom(
            $this->pageableModelResponse(array('pm_123', 'pm_124'), false),
            new Util\RequestOptions()
        );

        $seen = array();
        foreach ($collection->autoPagingIterator() as $item) {
            array_push($seen, $item['id']);
        }

        $this->assertSame($seen, array('pm_123', 'pm_124'));
    }

    public function testAutoPagingThreePages()
    {
        $collection = Collection::constructFrom(
            $this->pageableModelResponse(array('pm_123', 'pm_124'), true),
            new Util\RequestOptions()
        );
        $collection->setRequestParams(array('foo' => 'bar'));

        $this->mockRequest(
            'GET',
            '/v1/pageablemodels',
            array(
                  'foo' => 'bar',
                  'starting_after' => 'pm_124'
            ),
            $this->pageableModelResponse(array('pm_125', 'pm_126'), true)
        );
        $this->mockRequest(
            'GET',
            '/v1/pageablemodels',
            array(
                  'foo' => 'bar',
                  'starting_after' => 'pm_126'
            ),
            $this->pageableModelResponse(array('pm_127'), false)
        );

        $seen = array();
        foreach ($collection->autoPagingIterator() as $item) {
            array_push($seen, $item['id']);
        }

        $this->assertSame($seen, array('pm_123', 'pm_124', 'pm_125', 'pm_126', 'pm_127'));
    }
}
